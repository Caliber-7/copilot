from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.database import get_db
from app.models.anomaly import Anomaly
from app.schemas.anomaly import AnomalyCreate, AnomalyUpdate, AnomalyResponse, AnomalyListResponse
from app.services.audit import audit_service

router = APIRouter(prefix="/api/anomalies", tags=["Anomalies"])

@router.get("", response_model=AnomalyListResponse)
def list_anomalies(
    severity: Optional[str] = Query(None, description="Filter by severity (HIGH, MEDIUM, LOW, etc.)"),
    subsystem: Optional[str] = Query(None, description="Filter by subsystem (POWER, COMM, THERMAL, etc.)"),
    status: Optional[str] = Query(None, description="Filter by status (INVESTIGATING, NEW, CLOSED, etc.)"),
    search: Optional[str] = Query(None, description="Search keyword in title or ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Anomaly)

    if severity and severity != "All Severities":
        query = query.filter(Anomaly.severity.ilike(severity))
    if subsystem and subsystem != "All Subsystems":
        query = query.filter(Anomaly.subsystem.ilike(subsystem))
    if status and status != "All Statuses":
        # Handle frontend variations like "Investigating" vs "INVESTIGATING"
        clean_status = status.upper().replace(" ", "_")
        query = query.filter(Anomaly.status.ilike(f"%{clean_status}%"))
    if search:
        s = f"%{search}%"
        query = query.filter(or_(Anomaly.title.ilike(s), Anomaly.id.ilike(s), Anomaly.description.ilike(s)))

    total = query.count()
    offset = (page - 1) * page_size
    items = query.order_by(Anomaly.detected_at.desc()).offset(offset).limit(page_size).all()

    return AnomalyListResponse(total=total, items=items)

@router.get("/{anomaly_id}", response_model=AnomalyResponse)
def get_anomaly(anomaly_id: str, db: Session = Depends(get_db)):
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail=f"Anomaly {anomaly_id} not found.")
    return anomaly

@router.post("", response_model=AnomalyResponse, status_code=201)
def create_anomaly(payload: AnomalyCreate, db: Session = Depends(get_db)):
    # Auto-generate ID if omitted
    anom_id = payload.id
    if not anom_id:
        count = db.query(Anomaly).count()
        anom_id = f"ANOM-{count:03d}"

    existing = db.query(Anomaly).filter(Anomaly.id == anom_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Anomaly ID {anom_id} already exists.")

    new_anom = Anomaly(
        id=anom_id,
        spacecraft_id=payload.spacecraft_id,
        title=payload.title,
        subsystem=payload.subsystem,
        severity=payload.severity,
        status="NEW",
        confidence=payload.confidence,
        detected_at=payload.detected_at or datetime.utcnow(),
        description=payload.description,
        telemetry_triggers=payload.telemetry_triggers
    )
    db.add(new_anom)
    db.commit()
    db.refresh(new_anom)

    audit_service.log_event(
        db=db,
        actor="Operator",
        action="Created anomaly",
        object_id=new_anom.id,
        details={"title": new_anom.title, "subsystem": new_anom.subsystem}
    )

    return new_anom

@router.patch("/{anomaly_id}", response_model=AnomalyResponse)
def update_anomaly(anomaly_id: str, payload: AnomalyUpdate, db: Session = Depends(get_db)):
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail=f"Anomaly {anomaly_id} not found.")

    if payload.status:
        anomaly.status = payload.status
    if payload.confidence is not None:
        anomaly.confidence = payload.confidence
    if payload.description:
        anomaly.description = payload.description
    if payload.reviewed_by:
        anomaly.reviewed_by = payload.reviewed_by
        anomaly.reviewed_at = datetime.utcnow()

    anomaly.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(anomaly)

    audit_service.log_event(
        db=db,
        actor=payload.reviewed_by or "Operator",
        action="Updated anomaly status",
        object_id=anomaly.id,
        details={"status": anomaly.status, "confidence": anomaly.confidence}
    )

    return anomaly
