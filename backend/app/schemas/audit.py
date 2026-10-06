from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class AuditEventBase(BaseModel):
    actor: str = "Operator" # Operator, System, AI Copilot
    action: str
    object_id: Optional[str] = None
    evidence_ref: Optional[str] = None
    result: str = "Success"
    details: Dict[str, Any] = Field(default_factory=dict)

class AuditEventCreate(AuditEventBase):
    pass

class AuditEventResponse(AuditEventBase):
    id: str
    timestamp: datetime

    class Config:
        from_attributes = True

class AuditListResponse(BaseModel):
    total: int
    items: List[AuditEventResponse]
