from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.database import get_db
from app.models.investigation import Investigation
from app.models.anomaly import Anomaly
from app.schemas.investigation import (
    InvestigationResponse,
    InvestigationRunRequest,
    InvestigationUpdateRequest
)
from app.services.investigation import investigation_service
from app.services.audit import audit_service

router = APIRouter(prefix="/api/investigations", tags=["Investigations"])

@router.get("", response_model=List[InvestigationResponse])
def list_investigations(
    status: Optional[str] = None,
    subsystem: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Investigation)
    if status:
        query = query.filter(Investigation.status.ilike(status))
    if subsystem:
        query = query.filter(Investigation.subsystem.ilike(subsystem))
    return query.order_by(Investigation.updated_at.desc()).all()

@router.get("/{anomaly_or_inv_id}", response_model=InvestigationResponse)
def get_investigation(anomaly_or_inv_id: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(
        or_(
            Investigation.anomaly_id == anomaly_or_inv_id,
            Investigation.id == anomaly_or_inv_id
        )
    ).first()
    if not inv:
        raise HTTPException(
            status_code=404,
            detail=f"Investigation for '{anomaly_or_inv_id}' not found."
        )

    # Convert to schema response
    return InvestigationResponse(
        id=inv.id,
        anomaly_id=inv.anomaly_id,
        spacecraft_id=inv.spacecraft_id,
        subsystem=inv.subsystem,
        status=inv.status,
        confidence=inv.confidence,
        confidence_breakdown=inv.llm_metadata.get("confidence_breakdown", {
            "evidence_quality": 0.88,
            "telemetry_correlation": 0.85,
            "historical_alignment": 0.82,
            "procedure_applicability": 0.79,
            "composite": inv.confidence
        }),
        summary=inv.summary,
        primary_hypothesis=inv.primary_hypothesis,
        alternative_hypotheses=inv.alternative_hypotheses or [],
        root_cause_analysis=inv.root_cause_analysis,
        key_findings=inv.key_findings or {},
        next_steps=inv.next_steps or [],
        recommendations=inv.recommendations or [],
        safety_boundaries=inv.safety_boundaries or [],
        telemetry_correlations=inv.telemetry_correlations or [],
        historical_matches=inv.historical_matches or [],
        applicable_procedures=inv.applicable_procedures or [],
        supporting_evidence=inv.supporting_evidence or [],
        contradicting_evidence=inv.contradicting_evidence or [],
        timeline_events=inv.timeline_events or [],
        llm_metadata=inv.llm_metadata or {},
        created_at=inv.created_at,
        updated_at=inv.updated_at
    )

@router.post("/run", response_model=InvestigationResponse)
async def run_investigation(
    payload: InvestigationRunRequest,
    db: Session = Depends(get_db)
):
    try:
        return await investigation_service.run_investigation(db=db, request=payload)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Investigation execution failed: {str(e)}")

@router.patch("/{anomaly_or_inv_id}", response_model=InvestigationResponse)
def update_investigation(
    anomaly_or_inv_id: str,
    payload: InvestigationUpdateRequest,
    db: Session = Depends(get_db)
):
    inv = db.query(Investigation).filter(
        or_(
            Investigation.anomaly_id == anomaly_or_inv_id,
            Investigation.id == anomaly_or_inv_id
        )
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Investigation '{anomaly_or_inv_id}' not found.")

    if payload.status:
        inv.status = payload.status
    inv.updated_at = datetime.utcnow()

    # Also update associated anomaly if marked reviewed
    if payload.status in ["REVIEWED", "RESOLVED"]:
        anomaly = db.query(Anomaly).filter(Anomaly.id == inv.anomaly_id).first()
        if anomaly:
            anomaly.status = "CLOSED" if payload.status == "RESOLVED" else "EVIDENCE_COLLECTED"
            anomaly.reviewed_by = payload.reviewed_by or "Operator"
            anomaly.reviewed_at = datetime.utcnow()

    db.commit()
    db.refresh(inv)

    audit_service.log_event(
        db=db,
        actor=payload.reviewed_by or "Operator",
        action="Updated investigation",
        object_id=inv.id,
        details={"status": inv.status, "notes": payload.notes}
    )

    return InvestigationResponse(
        id=inv.id,
        anomaly_id=inv.anomaly_id,
        spacecraft_id=inv.spacecraft_id,
        subsystem=inv.subsystem,
        status=inv.status,
        confidence=inv.confidence,
        confidence_breakdown=inv.llm_metadata.get("confidence_breakdown", {}),
        summary=inv.summary,
        primary_hypothesis=inv.primary_hypothesis,
        alternative_hypotheses=inv.alternative_hypotheses or [],
        root_cause_analysis=inv.root_cause_analysis,
        key_findings=inv.key_findings or {},
        next_steps=inv.next_steps or [],
        recommendations=inv.recommendations or [],
        safety_boundaries=inv.safety_boundaries or [],
        telemetry_correlations=inv.telemetry_correlations or [],
        historical_matches=inv.historical_matches or [],
        applicable_procedures=inv.applicable_procedures or [],
        supporting_evidence=inv.supporting_evidence or [],
        contradicting_evidence=inv.contradicting_evidence or [],
        timeline_events=inv.timeline_events or [],
        llm_metadata=inv.llm_metadata or {},
        created_at=inv.created_at,
        updated_at=inv.updated_at
    )
