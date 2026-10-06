from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.investigation import Investigation
from app.models.mission_log import MissionLog
from app.models.telemetry import TelemetryRecord

router = APIRouter(prefix="/api/timeline", tags=["Timeline"])

@router.get("")
def get_timeline(
    anomaly_id: Optional[str] = Query("ANOM-004", description="Anomaly ID"),
    source: Optional[str] = Query(None, description="Filter by source (Telemetry, Log, RAG, System, AI Copilot)"),
    subsystem: Optional[str] = Query(None, description="Filter by subsystem"),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Returns the chronological event timeline leading up to and during the anomaly.
    Matching image.png Panel 6.
    """
    # Fetch from investigation first
    inv = db.query(Investigation).filter(Investigation.anomaly_id == anomaly_id).first()
    
    if inv and inv.timeline_events:
        events = list(inv.timeline_events)
    else:
        # Fallback default sequence
        events = [
            {"time": "14:30:12", "event": "Battery current increased from 15.8A to 18.7A", "source": "Telemetry", "subsystem": "POWER"},
            {"time": "14:32:04", "event": "Battery temperature exceeded threshold", "source": "Log", "subsystem": "THERMAL"},
            {"time": "14:32:15", "event": "FDIR warning - power subsystem", "source": "Log", "subsystem": "FDIR"},
            {"time": "14:32:16", "event": "Packet transmission delayed by 1.2s", "source": "Log", "subsystem": "COMM"},
            {"time": "14:33:02", "event": "Similar incident INC-102 found", "source": "RAG", "subsystem": "SYSTEM"},
            {"time": "14:33:15", "event": "Correlation analysis completed", "source": "System", "subsystem": "SYSTEM"},
            {"time": "14:33:42", "event": "Investigation generated", "source": "AI Copilot", "subsystem": "AI"}
        ]

    # Filter by source if specified
    if source and source.lower() != "all sources":
        events = [e for e in events if e.get("source", "").lower() == source.lower()]

    # Filter by subsystem if specified
    if subsystem and subsystem.lower() != "all subsystems":
        events = [e for e in events if e.get("subsystem", "").lower() == subsystem.lower()]

    return events
