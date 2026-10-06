from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.database import get_db
from app.models.evidence import EvidenceItem
from app.schemas.evidence import (
    EvidenceResponse,
    EvidenceListResponse,
    EvidenceValidateRequest,
    EvidenceValidateResponse
)
from app.services.audit import audit_service

router = APIRouter(prefix="/api/evidence", tags=["Evidence"])

@router.get("", response_model=EvidenceListResponse)
def list_evidence(
    anomaly_id: Optional[str] = Query(None, description="Filter by associated anomaly ID"),
    source_type: Optional[str] = Query(None, alias="type", description="Filter by source type (telemetry, log, procedure, incident)"),
    subsystem: Optional[str] = Query(None, description="Filter by subsystem"),
    validation_status: Optional[str] = Query(None, description="Filter by validation status"),
    search: Optional[str] = Query(None, description="Search keyword in title or source_id"),
    min_relevance: float = Query(0.0, ge=0.0, le=1.0),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(EvidenceItem).filter(EvidenceItem.relevance >= min_relevance)

    if anomaly_id:
        query = query.filter(EvidenceItem.anomaly_id == anomaly_id)
    if source_type and source_type.lower() != "all types":
        query = query.filter(EvidenceItem.source_type.ilike(source_type.lower()))
    if subsystem and subsystem.lower() != "all subsystems":
        query = query.filter(EvidenceItem.subsystem.ilike(subsystem))
    if validation_status and validation_status.lower() != "all":
        query = query.filter(EvidenceItem.validation_status.ilike(validation_status))
    if search:
        s = f"%{search}%"
        query = query.filter(or_(EvidenceItem.title.ilike(s), EvidenceItem.source_id.ilike(s)))

    total = query.count()
    offset = (page - 1) * page_size
    items = query.order_by(EvidenceItem.relevance.desc()).offset(offset).limit(page_size).all()

    return EvidenceListResponse(total=total, items=items)

@router.get("/{evidence_id}", response_model=EvidenceResponse)
def get_evidence_detail(evidence_id: str, db: Session = Depends(get_db)):
    item = db.query(EvidenceItem).filter(
        or_(EvidenceItem.id == evidence_id, EvidenceItem.source_id == evidence_id)
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail=f"Evidence item {evidence_id} not found.")
    return item

@router.post("/validate", response_model=EvidenceValidateResponse)
def validate_evidence(payload: EvidenceValidateRequest, db: Session = Depends(get_db)):
    item = db.query(EvidenceItem).filter(
        or_(EvidenceItem.id == payload.evidence_id, EvidenceItem.source_id == payload.evidence_id)
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail=f"Evidence item {payload.evidence_id} not found.")

    item.validation_status = payload.validation_status
    db.commit()

    audit_service.log_event(
        db=db,
        actor="Operator",
        action="Evidence validated",
        object_id=item.source_id,
        result="Success",
        details={
            "validation_status": payload.validation_status,
            "notes": payload.validation_notes
        }
    )

    return EvidenceValidateResponse(
        evidence_id=item.id,
        validation_status=item.validation_status,
        updated_at=datetime.utcnow(),
        message=f"Evidence {item.source_id} successfully marked as {payload.validation_status}"
    )
