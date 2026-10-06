from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class KeyFindingsCounts(BaseModel):
    observed_facts: int = 5
    inferences: int = 2
    recommendations: int = 3
    evidence: int = 8

class InvestigationRunRequest(BaseModel):
    anomaly_id: str
    custom_query: Optional[str] = None
    operator_id: str = "Operator"

class InvestigationUpdateRequest(BaseModel):
    status: Optional[str] = None # IN_PROGRESS, REVIEWED, RESOLVED
    reviewed_by: Optional[str] = None
    notes: Optional[str] = None

class InvestigationResponse(BaseModel):
    id: str
    anomaly_id: str
    spacecraft_id: str = "SC-01"
    subsystem: str
    status: str
    confidence: float
    confidence_breakdown: Dict[str, float] = Field(default_factory=dict)
    summary: str
    primary_hypothesis: str
    alternative_hypotheses: List[str] = Field(default_factory=list)
    root_cause_analysis: str
    key_findings: Dict[str, Any] = Field(default_factory=dict)
    next_steps: List[str] = Field(default_factory=list)
    recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    safety_boundaries: List[str] = Field(default_factory=list)
    telemetry_correlations: List[Dict[str, Any]] = Field(default_factory=list)
    historical_matches: List[Dict[str, Any]] = Field(default_factory=list)
    applicable_procedures: List[Dict[str, Any]] = Field(default_factory=list)
    supporting_evidence: List[Dict[str, Any]] = Field(default_factory=list)
    contradicting_evidence: List[Dict[str, Any]] = Field(default_factory=list)
    timeline_events: List[Dict[str, Any]] = Field(default_factory=list)
    llm_metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CopilotQueryRequest(BaseModel):
    query: str
    anomaly_id: Optional[str] = "ANOM-004"
    session_id: Optional[str] = "sess-01"

class CopilotQueryResponse(BaseModel):
    query: str
    answer: str
    confidence: float
    sources_count: int
    supporting_evidence: List[Dict[str, Any]] = Field(default_factory=list)
    suggested_actions: List[str] = Field(default_factory=list)
    llm_metadata: Dict[str, Any] = Field(default_factory=dict)
