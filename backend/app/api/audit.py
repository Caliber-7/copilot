from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.audit import AuditEvent
from app.schemas.audit import AuditEventCreate, AuditEventResponse, AuditListResponse
from app.services.audit import audit_service

router = APIRouter(prefix="/api/audit", tags=["Audit Trail"])

@router.get("", response_model=AuditListResponse)
def list_audit_trail(
    actor: Optional[str] = Query(None, description="Filter by actor (Operator, System, AI Copilot)"),
    action: Optional[str] = Query(None, description="Filter by action name"),
    search: Optional[str] = Query(None, description="Search term in action or object_id"),
    hours: Optional[int] = Query(24, ge=1, le=720, description="Hours of lookback history"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    offset = (page - 1) * page_size
    items = audit_service.query_audit_trail(
        db=db,
        actor=actor,
        action=action,
        search=search,
        hours=hours,
        limit=page_size,
        offset=offset
    )
    total = db.query(AuditEvent).count()
    return AuditListResponse(total=total, items=items)

@router.post("", response_model=AuditEventResponse, status_code=201)
def record_audit_event(payload: AuditEventCreate, db: Session = Depends(get_db)):
    """
    Allows the frontend console to log operator review actions, recommendation views, or inspection events.
    """
    return audit_service.log_event(
        db=db,
        actor=payload.actor,
        action=payload.action,
        object_id=payload.object_id,
        evidence_ref=payload.evidence_ref,
        result=payload.result,
        details=payload.details
    )
