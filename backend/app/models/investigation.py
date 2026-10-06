from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, JSON, ForeignKey
from app.db.database import Base

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String, primary_key=True, index=True) # INV-004
    anomaly_id = Column(String, ForeignKey("anomalies.id"), index=True, unique=True, nullable=False)
    spacecraft_id = Column(String, default="SC-01", index=True)
    subsystem = Column(String, nullable=False, index=True)
    status = Column(String, default="IN_PROGRESS", index=True) # IN_PROGRESS, REVIEWED, RESOLVED
    confidence = Column(Float, default=0.0)
    summary = Column(Text, nullable=False)
    primary_hypothesis = Column(Text, nullable=False)
    alternative_hypotheses = Column(JSON, default=list)
    root_cause_analysis = Column(Text, nullable=False)
    key_findings = Column(JSON, default=dict) # observed_facts, inferences, recommendations, evidence counts
    next_steps = Column(JSON, default=list) # List of ordered actionable steps
    recommendations = Column(JSON, default=list) # Detailed recovery & diagnostic steps
    safety_boundaries = Column(JSON, default=list) # Safety rules & operational constraints
    telemetry_correlations = Column(JSON, default=list) # Correlated parameters & statistics
    historical_matches = Column(JSON, default=list) # Similar past incidents
    applicable_procedures = Column(JSON, default=list) # Procedures & checklist items
    supporting_evidence = Column(JSON, default=list)
    contradicting_evidence = Column(JSON, default=list)
    timeline_events = Column(JSON, default=list)
    llm_metadata = Column(JSON, default=dict) # Provider, model, latency, tokens, mode
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
