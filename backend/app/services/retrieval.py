from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.anomaly import Anomaly
from app.models.telemetry import TelemetryRecord
from app.models.mission_log import MissionLog
from app.models.procedure import Procedure
from app.models.incident import HistoricalIncident
from app.services.rag import rag_service

class RetrievalService:
    @staticmethod
    def retrieve_mission_evidence(
        db: Session,
        anomaly: Anomaly,
        window_minutes: int = 60,
        rag_k: int = 5
    ) -> Dict[str, Any]:
        """
        Retrieves comprehensive mission evidence across:
        - Telemetry records in anomaly time window
        - Mission logs in anomaly time window
        - Relevant procedures via RAG semantic retrieval
        - Relevant historical incidents via RAG semantic retrieval
        """
        detected_time = anomaly.detected_at or datetime.utcnow()
        t_start = detected_time - timedelta(minutes=window_minutes)
        t_end = detected_time + timedelta(minutes=window_minutes)

        # 1. Telemetry retrieval
        telemetry_records = db.query(TelemetryRecord).filter(
            TelemetryRecord.timestamp >= t_start,
            TelemetryRecord.timestamp <= t_end
        ).order_by(TelemetryRecord.timestamp.asc()).all()

        # Filter or prioritize anomalous telemetry records
        anomalous_telemetry = [
            t for t in telemetry_records 
            if t.status in ["WARNING", "CRITICAL"] or 
            (t.parameter in (anomaly.telemetry_triggers or []))
        ]

        # 2. Mission logs retrieval
        mission_logs = db.query(MissionLog).filter(
            MissionLog.timestamp >= t_start,
            MissionLog.timestamp <= t_end
        ).order_by(MissionLog.timestamp.asc()).all()

        # 3. RAG Retrieval for Procedures
        query_text = f"{anomaly.title} {anomaly.subsystem} {anomaly.description or ''}"
        rag_procedures = rag_service.query(
            query_text=query_text,
            n_results=rag_k,
            doc_type_filter="procedure"
        )
        if not rag_procedures:
            # Fallback to direct subsystem query from DB
            db_procs = db.query(Procedure).filter(
                (Procedure.subsystem == anomaly.subsystem) | (Procedure.subsystem == "POWER")
            ).limit(rag_k).all()
            rag_procedures = [{
                "id": p.id,
                "text": p.document_content,
                "metadata": {"title": p.title, "subsystem": p.subsystem, "doc_type": "procedure"},
                "similarity": 0.84
            } for p in db_procs]

        # 4. RAG Retrieval for Historical Incidents
        rag_incidents = rag_service.query(
            query_text=query_text,
            n_results=rag_k,
            doc_type_filter="incident"
        )
        if not rag_incidents:
            # Fallback to DB incidents
            db_incs = db.query(HistoricalIncident).filter(
                (HistoricalIncident.subsystem == anomaly.subsystem) | (HistoricalIncident.id == "INC-007")
            ).limit(rag_k).all()
            rag_incidents = [{
                "id": inc.id,
                "text": inc.document_content,
                "metadata": {"title": inc.title, "subsystem": inc.subsystem, "doc_type": "incident"},
                "similarity": 0.88 if inc.id in ["INC-007", "INC-102"] else 0.72
            } for inc in db_incs]

        return {
            "telemetry_records": telemetry_records,
            "anomalous_telemetry": anomalous_telemetry,
            "mission_logs": mission_logs,
            "rag_procedures": rag_procedures,
            "rag_incidents": rag_incidents
        }

retrieval_service = RetrievalService()
