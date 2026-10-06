from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.audit import AuditEvent

class AuditService:
    @staticmethod
    def log_event(
        db: Session,
        actor: str,
        action: str,
        object_id: Optional[str] = None,
        evidence_ref: Optional[str] = None,
        result: str = "Success",
        details: Optional[Dict[str, Any]] = None
    ) -> AuditEvent:
        """
        Records an immutable audit trail entry for all operator and system actions.
        """
        # Generate monotonic ID
        count = db.query(AuditEvent).count()
        event_id = f"AUD-{count + 1:04d}"

        event = AuditEvent(
            id=event_id,
            timestamp=datetime.utcnow(),
            actor=actor,
            action=action,
            object_id=object_id,
            evidence_ref=evidence_ref,
            result=result,
            details=details or {}
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    @staticmethod
    def query_audit_trail(
        db: Session,
        actor: Optional[str] = None,
        action: Optional[str] = None,
        search: Optional[str] = None,
        hours: Optional[int] = 24,
        limit: int = 50,
        offset: int = 0
    ) -> List[AuditEvent]:
        query = db.query(AuditEvent)

        if actor and actor != "All Actors":
            query = query.filter(AuditEvent.actor == actor)
        if action and action != "All Actions":
            query = query.filter(AuditEvent.action == action)
        if hours:
            cutoff = datetime.utcnow() - timedelta(hours=hours)
            query = query.filter(AuditEvent.timestamp >= cutoff)
        if search:
            s = f"%{search}%"
            query = query.filter(
                (AuditEvent.action.ilike(s)) |
                (AuditEvent.object_id.ilike(s)) |
                (AuditEvent.actor.ilike(s))
            )

        return query.order_by(AuditEvent.timestamp.desc()).offset(offset).limit(limit).all()

audit_service = AuditService()
