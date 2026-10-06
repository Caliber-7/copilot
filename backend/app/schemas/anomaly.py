from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class AnomalyBase(BaseModel):
    title: str
    subsystem: str
    severity: str = "HIGH"
    description: Optional[str] = None
    telemetry_triggers: List[str] = Field(default_factory=list)

class AnomalyCreate(AnomalyBase):
    id: Optional[str] = None
    spacecraft_id: str = "SC-01"
    detected_at: Optional[datetime] = None
    confidence: float = 0.0

class AnomalyUpdate(BaseModel):
    status: Optional[str] = None # NEW, INVESTIGATING, EVIDENCE_COLLECTED, CLOSED
    confidence: Optional[float] = None
    reviewed_by: Optional[str] = None
    description: Optional[str] = None

class AnomalyResponse(BaseModel):
    id: str
    spacecraft_id: str
    title: str
    subsystem: str
    severity: str
    status: str
    confidence: float
    detected_at: datetime
    description: Optional[str] = None
    telemetry_triggers: List[str] = Field(default_factory=list)
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AnomalyListResponse(BaseModel):
    total: int
    items: List[AnomalyResponse]
