from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text
from app.db.database import Base

class MissionLog(Base):
    __tablename__ = "mission_logs"

    id = Column(String, primary_key=True, index=True) # LOG-223
    spacecraft_id = Column(String, default="SC-01", index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    subsystem = Column(String, nullable=False, index=True) # POWER, THERMAL, COMM, ATTITUDE, FDIR
    severity = Column(String, nullable=False, index=True) # INFO, WARNING, ERROR, CRITICAL
    message = Column(Text, nullable=False)
    source = Column(String, default="SYSTEM") # FDIR, Telemetry Engine, Flight Computer, Ground Station
