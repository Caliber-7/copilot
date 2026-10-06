from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class EvidenceBase(BaseModel):
    anomaly_id: Optional[str] = None
    source_type: str # telemetry, log, procedure, incident
    source_id: str # TEL-4821, LOG-223, etc.
    title: str
    subsystem: str
    timestamp: Optional[datetime] = None
    relevance: float = 0.0 # 0.0 to 1.0
    validation_status: str = "VALIDATED" # VALIDATED, CONTRADICTED, UNVERIFIED
    details: Dict[str, Any] = Field(default_factory=dict)

class EvidenceCreate(EvidenceBase):
    id: Optional[str] = None

class EvidenceResponse(EvidenceBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class EvidenceValidateRequest(BaseModel):
    evidence_id: str
    validation_status: str # VALIDATED, CONTRADICTED, UNVERIFIED
    validation_notes: Optional[str] = None

class EvidenceValidateResponse(BaseModel):
    evidence_id: str
    validation_status: str
    updated_at: datetime
    message: str

class EvidenceListResponse(BaseModel):
    total: int
    items: List[EvidenceResponse]
