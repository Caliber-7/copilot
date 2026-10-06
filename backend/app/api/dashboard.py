from datetime import datetime
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.anomaly import Anomaly
from app.config import settings

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Returns spacecraft status, recent alerts, timeline milestones, and investigation queue.
    Directly matches Mission Dashboard (image.png Panel 1).
    """
    active_anomalies_count = db.query(Anomaly).filter(Anomaly.status != "CLOSED").count()

    anomalies_queue = db.query(Anomaly).filter(Anomaly.status != "CLOSED").order_by(Anomaly.detected_at.desc()).limit(5).all()
    queue_items = [
        {
            "id": a.id,
            "title": a.title,
            "severity": a.severity.capitalize(),
            "time": a.detected_at.strftime("%H:%M") if a.detected_at else "14:32"
        }
        for a in anomalies_queue
    ]

    recent_alerts = [
        {"id": "PWR-204", "title": "Battery temperature increase", "time": "14:32", "severity": "High"},
        {"id": "FDIR-001", "title": "Power subsystem warning", "time": "14:32", "severity": "Medium"},
        {"id": "COMM-015", "title": "Packet transmission delay", "time": "14:33", "severity": "Low"},
        {"id": "THERM-003", "title": "Radiator temp nominal", "time": "14:20", "severity": "Info"}
    ]

    return {
        "spacecraft_id": settings.SPACECRAFT_ID,
        "mission_day": 142,
        "timestamp_utc": "2026-06-24 14:37:22",
        "spacecraft_status": "Nominal",
        "spacecraft_status_message": "All systems operating within expected range",
        "active_anomalies": active_anomalies_count,
        "active_anomalies_message": "Requires Investigation" if active_anomalies_count > 0 else "No Active Anomalies",
        "subsystem_health": "8 / 10",
        "subsystem_health_status": "Healthy",
        "subsystem_health_percentage": 78,
        "mission_timeline": {
            "launch_day": 1,
            "mid_mission_day": 90,
            "current_day": 142,
            "end_day": 180,
            "percentage": 78
        },
        "recent_alerts": recent_alerts,
        "investigation_queue": queue_items,
        "simulation_mode": settings.SIMULATION_MODE,
        "system_online": True
    }
