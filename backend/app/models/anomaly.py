from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, JSON
from app.db.database import Base

class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(String, primary_key=True, index=True) # e.g. ANOM-004
    spacecraft_id = Column(String, default="SC-01", index=True)
    title = Column(String, nullable=False)
    subsystem = Column(String, nullable=False, index=True) # POWER, THERMAL, COMM, ATTITUDE, PAYLOAD
    severity = Column(String, nullable=False, index=True) # CRITICAL, HIGH, MEDIUM, LOW, INFO
    status = Column(String, default="NEW", index=True) # NEW, INVESTIGATING, EVIDENCE_COLLECTED, CLOSED
    confidence = Column(Float, default=0.0)
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    description = Column(Text, nullable=True)
    telemetry_triggers = Column(JSON, default=list) # List of parameter names or IDs
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
