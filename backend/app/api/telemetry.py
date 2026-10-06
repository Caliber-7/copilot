from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.database import get_db
from app.models.telemetry import TelemetryRecord
from app.schemas.telemetry import (
    TelemetryResponse,
    TelemetryCreate,
    ParameterMetadata,
    TelemetrySeriesResponse,
    TelemetryPoint,
    TelemetryCorrelationRequest,
    TelemetryCorrelationResponse
)
from app.services.correlation import correlation_service
from app.services.audit import audit_service

router = APIRouter(prefix="/api/telemetry", tags=["Telemetry"])

@router.get("", response_model=List[TelemetryResponse])
def list_telemetry(
    subsystem: Optional[str] = Query(None, description="Subsystem (POWER, THERMAL, etc.)"),
    parameter: Optional[str] = Query(None, description="Specific parameter name"),
    status: Optional[str] = Query(None, description="NOMINAL, WARNING, CRITICAL"),
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    query = db.query(TelemetryRecord)

    if subsystem and subsystem != "All Subsystems":
        query = query.filter(TelemetryRecord.subsystem.ilike(subsystem))
    if parameter:
        query = query.filter(TelemetryRecord.parameter.ilike(parameter))
    if status:
        query = query.filter(TelemetryRecord.status == status)
    if start_time:
        query = query.filter(TelemetryRecord.timestamp >= start_time)
    if end_time:
        query = query.filter(TelemetryRecord.timestamp <= end_time)

    return query.order_by(TelemetryRecord.timestamp.desc()).limit(limit).all()

@router.get("/parameters", response_model=List[ParameterMetadata])
def get_available_parameters(db: Session = Depends(get_db)):
    """
    Returns unique parameters, their units, subsystem, expected bounds, and current values.
    Used for Telemetry Explorer parameters list.
    """
    params_query = db.query(TelemetryRecord.parameter).distinct().all()
    out = []

    for (p_name,) in params_query:
        latest = db.query(TelemetryRecord).filter(
            TelemetryRecord.parameter == p_name
        ).order_by(TelemetryRecord.timestamp.desc()).first()

        if latest:
            out.append(ParameterMetadata(
                parameter=latest.parameter,
                subsystem=latest.subsystem,
                unit=latest.unit,
                expected_min=latest.expected_min or 0.0,
                expected_max=latest.expected_max or 100.0,
                latest_value=latest.value,
                status=latest.status
            ))

    return out

@router.get("/series", response_model=List[TelemetrySeriesResponse])
def get_telemetry_series(
    parameters: List[str] = Query(..., description="List of parameter names to query"),
    hours: float = Query(2.0, ge=0.1, le=72.0, description="Time range in hours"),
    db: Session = Depends(get_db)
):
    """
    Returns aligned time-series points for graphing in Telemetry Explorer.
    """
    # Base timestamp on latest recorded point in DB or UTC
    latest_record = db.query(TelemetryRecord).order_by(TelemetryRecord.timestamp.desc()).first()
    anchor_time = latest_record.timestamp if latest_record else datetime.utcnow()
    start_time = anchor_time - timedelta(hours=hours)

    series_list = []
    anomaly_marker = datetime(2026, 6, 24, 14, 32, 15)

    for p in parameters:
        records = db.query(TelemetryRecord).filter(
            TelemetryRecord.parameter == p,
            TelemetryRecord.timestamp >= start_time
        ).order_by(TelemetryRecord.timestamp.asc()).all()

        if not records:
            continue

        latest = records[-1]
        points = [
            TelemetryPoint(timestamp=r.timestamp, value=r.value, status=r.status)
            for r in records
        ]

        series_list.append(TelemetrySeriesResponse(
            parameter=p,
            subsystem=latest.subsystem,
            unit=latest.unit,
            expected_min=latest.expected_min,
            expected_max=latest.expected_max,
            current_value=latest.value,
            anomaly_detected_at=anomaly_marker,
            points=points
        ))

    return series_list

@router.post("/correlate", response_model=TelemetryCorrelationResponse)
def correlate_telemetry(payload: TelemetryCorrelationRequest, db: Session = Depends(get_db)):
    """
    Performs cross-parameter Pearson correlation analysis and computes time lags.
    """
    query = db.query(TelemetryRecord)
    if payload.subsystem:
        query = query.filter(TelemetryRecord.subsystem.ilike(payload.subsystem))
    if payload.start_time:
        query = query.filter(TelemetryRecord.timestamp >= payload.start_time)
    if payload.end_time:
        query = query.filter(TelemetryRecord.timestamp <= payload.end_time)

    records = query.order_by(TelemetryRecord.timestamp.asc()).all()

    param_series = {}
    for r in records:
        if payload.parameters and r.parameter not in payload.parameters:
            continue
        if r.parameter not in param_series:
            param_series[r.parameter] = []
        param_series[r.parameter].append((r.timestamp.timestamp(), r.value))

    pairs = correlation_service.analyze_correlations(param_series)

    t_start = payload.start_time or (records[0].timestamp if records else datetime.utcnow())
    t_end = payload.end_time or (records[-1].timestamp if records else datetime.utcnow())

    findings = []
    if pairs:
        top = pairs[0]
        findings.append(f"Strongest correlation detected between '{top.param_a}' and '{top.param_b}' (r={top.correlation_coefficient}, significance={top.significance}).")
        for p in pairs[1:3]:
            findings.append(f"{p.param_a} and {p.param_b} show {p.relationship}.")

    audit_service.log_event(
        db=db,
        actor="System",
        action="Telemetry correlation computed",
        details={"parameters": list(param_series.keys()), "pairs_count": len(pairs)}
    )

    return TelemetryCorrelationResponse(
        time_window_start=t_start,
        time_window_end=t_end,
        correlations=pairs,
        key_findings=findings
    )
