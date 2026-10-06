from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, JSON, ForeignKey
from app.db.database import Base

class EvidenceItem(Base):
    __tablename__ = "evidence_items"

    id = Column(String, primary_key=True, index=True) # e.g. EVID-001
    anomaly_id = Column(String, ForeignKey("anomalies.id"), index=True, nullable=True)
    source_type = Column(String, nullable=False, index=True) # telemetry, log, procedure, incident
    source_id = Column(String, nullable=False, index=True) # TEL-4821, LOG-223, PWR-204, INC-102
    title = Column(String, nullable=False)
    subsystem = Column(String, nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=True, index=True)
    relevance = Column(Float, default=0.0) # 0.0 to 1.0 relevance score
    validation_status = Column(String, default="VALIDATED") # VALIDATED, CONTRADICTED, UNVERIFIED
    details = Column(JSON, default=dict) # parameter, value, expected_range, unit, chart_points, message, snippet, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
