from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class TelemetryBase(BaseModel):
    spacecraft_id: str = "SC-01"
    timestamp: datetime
    subsystem: str
    parameter: str
    value: float
    unit: str
    expected_min: Optional[float] = None
    expected_max: Optional[float] = None
    status: str = "NOMINAL"

class TelemetryCreate(TelemetryBase):
    id: Optional[str] = None

class TelemetryResponse(TelemetryBase):
    id: str

    class Config:
        from_attributes = True

class TelemetryPoint(BaseModel):
    timestamp: datetime
    value: float
    status: str

class TelemetrySeriesResponse(BaseModel):
    parameter: str
    subsystem: str
    unit: str
    expected_min: Optional[float] = None
    expected_max: Optional[float] = None
    current_value: float
    anomaly_detected_at: Optional[datetime] = None
    points: List[TelemetryPoint]

class ParameterMetadata(BaseModel):
    parameter: str
    subsystem: str
    unit: str
    expected_min: float
    expected_max: float
    latest_value: float
    status: str

class TelemetryCorrelationRequest(BaseModel):
    parameters: List[str] = Field(default_factory=list)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    subsystem: Optional[str] = None

class CorrelationPair(BaseModel):
    param_a: str
    param_b: str
    correlation_coefficient: float
    time_lag_seconds: int = 0
    significance: str # HIGH, MODERATE, LOW
    relationship: str # e.g. "Directly leading", "Synchronous", "Inverse"

class TelemetryCorrelationResponse(BaseModel):
    time_window_start: datetime
    time_window_end: datetime
    correlations: List[CorrelationPair]
    key_findings: List[str]
