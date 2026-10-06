from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from app.db.database import Base

class TelemetryRecord(Base):
    __tablename__ = "telemetry_records"

    id = Column(String, primary_key=True, index=True) # TEL-4821
    spacecraft_id = Column(String, default="SC-01", index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    subsystem = Column(String, nullable=False, index=True) # POWER, THERMAL, COMMUNICATION, ATTITUDE
    parameter = Column(String, nullable=False, index=True) # Battery Current, Battery Voltage, etc.
    value = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    expected_min = Column(Float, nullable=True)
    expected_max = Column(Float, nullable=True)
    status = Column(String, default="NOMINAL", index=True) # NOMINAL, WARNING, CRITICAL
