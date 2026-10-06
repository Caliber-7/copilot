from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.seed import seed_database
from app.services.rag import rag_service
from app.services.audit import audit_service
from app.models.procedure import Procedure
from app.models.incident import HistoricalIncident

router = APIRouter(prefix="/api/demo", tags=["Demo Mode"])

@router.post("/load")
@router.post("/reset")
def load_demo_incident(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Resets the database and loads the prepared demo scenario:
    - Anomaly (ANOM-004 Battery Thermal Anomaly)
    - Telemetry data (last 2 hours)
    - Mission logs
    - Relevant procedures (PWR-204, etc.)
    - Historical incidents (INC-001 through INC-020)
    - Pre-populated investigation & timeline
    Directly matches image.png Panel 9.
    """
    seed_database(db=db)

    # Re-index RAG vector store for newly seeded procedures and incidents
    procedures = db.query(Procedure).all()
    for p in procedures:
        rag_service.index_document(
            doc_id=p.id,
            text=p.document_content,
            metadata={"title": p.title, "subsystem": p.subsystem, "doc_type": "procedure"}
        )

    incidents = db.query(HistoricalIncident).all()
    for inc in incidents:
        rag_service.index_document(
            doc_id=inc.id,
            text=inc.document_content,
            metadata={"title": inc.title, "subsystem": inc.subsystem, "doc_type": "incident"}
        )

    audit_service.log_event(
        db=db,
        actor="Operator",
        action="Loaded demo incident",
        object_id="ANOM-004",
        details={"scenario": "Battery Thermal Anomaly", "spacecraft": "SC-01"}
    )

    return {
        "status": "success",
        "message": "Demo scenario loaded successfully: ANOM-004 Battery Thermal Anomaly.",
        "loaded_components": {
            "anomaly": "ANOM-004 (Battery Thermal Anomaly, High Severity)",
            "telemetry_span": "2 Hours (13:00 - 15:00 UTC)",
            "telemetry_records_count": 47,
            "mission_logs_count": 9,
            "procedures_count": len(procedures),
            "historical_incidents_count": len(incidents),
            "investigation_status": "INVESTIGATING",
            "initial_confidence": 0.82
        }
    }
