from sqlalchemy import Column, String, Text, JSON
from app.db.database import Base

class Procedure(Base):
    __tablename__ = "procedures"

    id = Column(String, primary_key=True, index=True) # PWR-204, COMM-015, etc.
    title = Column(String, nullable=False)
    subsystem = Column(String, nullable=False, index=True) # POWER, THERMAL, COMM, ATTITUDE, FDIR
    category = Column(String, default="INVESTIGATION") # INVESTIGATION, RECOVERY, CONTINGENCY
    description = Column(Text, nullable=False)
    steps = Column(JSON, default=list) # List of step items
    safety_constraints = Column(JSON, default=list) # List of constraints / warnings
    applicable_conditions = Column(JSON, default=list) # Conditions under which procedure applies
    document_content = Column(Text, nullable=False) # Full RAG-searchable text representation
