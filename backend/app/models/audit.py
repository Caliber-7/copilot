from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON
from app.db.database import Base

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String, primary_key=True, index=True) # e.g. AUD-001
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    actor = Column(String, nullable=False, index=True) # Operator, System, AI Copilot
    action = Column(String, nullable=False, index=True) # Opened investigation, RAG retrieval executed, etc.
    object_id = Column(String, nullable=True, index=True) # ANOM-004, TEL-4821, etc.
    evidence_ref = Column(String, nullable=True) # "8 sources", "TEL-4821", etc.
    result = Column(String, default="Success", index=True) # Success, Warning, Failed
    details = Column(JSON, default=dict)
