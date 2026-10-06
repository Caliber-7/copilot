from sqlalchemy import Column, String, Text, JSON
from app.db.database import Base

class HistoricalIncident(Base):
    __tablename__ = "historical_incidents"

    id = Column(String, primary_key=True, index=True) # INC-007, INC-102
    title = Column(String, nullable=False)
    subsystem = Column(String, nullable=False, index=True) # POWER, THERMAL, COMM, ATTITUDE, PAYLOAD
    description = Column(Text, nullable=False)
    symptoms = Column(JSON, default=list) # List of observable symptoms
    root_cause = Column(Text, nullable=False)
    evidence = Column(JSON, default=list) # Supporting telemetry/log references
    resolution = Column(Text, nullable=False)
    lessons_learned = Column(Text, nullable=False)
    incident_date = Column(String, nullable=False) # e.g. "2023-11-14"
    document_content = Column(Text, nullable=False) # Full RAG-searchable text representation
