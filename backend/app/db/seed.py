import json
from datetime import datetime, timedelta
from pathlib import Path
from sqlalchemy.orm import Session
from app.config import settings
from app.db.database import SessionLocal, init_db
from app.models.anomaly import Anomaly
from app.models.telemetry import TelemetryRecord
from app.models.mission_log import MissionLog
from app.models.procedure import Procedure
from app.models.incident import HistoricalIncident
from app.models.evidence import EvidenceItem
from app.models.audit import AuditEvent
from app.models.investigation import Investigation

def seed_database(db: Session = None):
    should_close = False
    if db is None:
        init_db()
        db = SessionLocal()
        should_close = True

    try:
        # Clear existing tables for a clean seed
        db.query(Investigation).delete()
        db.query(EvidenceItem).delete()
        db.query(AuditEvent).delete()
        db.query(TelemetryRecord).delete()
        db.query(MissionLog).delete()
        db.query(Procedure).delete()
        db.query(HistoricalIncident).delete()
        db.query(Anomaly).delete()
        db.commit()

        # 1. Seed Procedures
        proc_path = settings.PROCEDURES_DIR / "procedures.json"
        if proc_path.exists():
            with open(proc_path, "r", encoding="utf-8") as f:
                proc_data = json.load(f)
                for item in proc_data:
                    proc = Procedure(
                        id=item["id"],
                        title=item["title"],
                        subsystem=item["subsystem"],
                        category=item.get("category", "INVESTIGATION"),
                        description=item["description"],
                        steps=item.get("steps", []),
                        safety_constraints=item.get("safety_constraints", []),
                        applicable_conditions=item.get("applicable_conditions", []),
                        document_content=item.get("document_content", item["description"])
                    )
                    db.add(proc)
            db.commit()

        # 2. Seed Historical Incidents
        inc_path = settings.INCIDENTS_DIR / "incidents.json"
        if inc_path.exists():
            with open(inc_path, "r", encoding="utf-8") as f:
                inc_data = json.load(f)
                for item in inc_data:
                    inc = HistoricalIncident(
                        id=item["id"],
                        title=item["title"],
                        subsystem=item["subsystem"],
                        description=item["description"],
                        symptoms=item.get("symptoms", []),
                        root_cause=item["root_cause"],
                        evidence=item.get("evidence", []),
                        resolution=item["resolution"],
                        lessons_learned=item["lessons_learned"],
                        incident_date=item.get("incident_date", "2024-01-01"),
                        document_content=item.get("document_content", item["description"])
                    )
                    db.add(inc)
            db.commit()

        # 3. Seed Telemetry
        tel_path = settings.TELEMETRY_DIR / "sc01_telemetry.json"
        if tel_path.exists():
            with open(tel_path, "r", encoding="utf-8") as f:
                tel_data = json.load(f)
                for item in tel_data:
                    ts = datetime.fromisoformat(item["timestamp"])
                    tel = TelemetryRecord(
                        id=item["id"],
                        spacecraft_id=item.get("spacecraft_id", "SC-01"),
                        timestamp=ts,
                        subsystem=item["subsystem"],
                        parameter=item["parameter"],
                        value=float(item["value"]),
                        unit=item["unit"],
                        expected_min=item.get("expected_min"),
                        expected_max=item.get("expected_max"),
                        status=item.get("status", "NOMINAL")
                    )
                    db.add(tel)
            db.commit()

        # 4. Seed Mission Logs
        logs_path = settings.LOGS_DIR / "sc01_logs.json"
        if logs_path.exists():
            with open(logs_path, "r", encoding="utf-8") as f:
                logs_data = json.load(f)
                for item in logs_data:
                    ts = datetime.fromisoformat(item["timestamp"])
                    mlog = MissionLog(
                        id=item["id"],
                        spacecraft_id=item.get("spacecraft_id", "SC-01"),
                        timestamp=ts,
                        subsystem=item["subsystem"],
                        severity=item["severity"],
                        message=item["message"],
                        source=item.get("source", "SYSTEM")
                    )
                    db.add(mlog)
            db.commit()

        # 5. Seed Anomalies (matching image.png)
        anomalies_data = [
            {
                "id": "ANOM-004",
                "spacecraft_id": "SC-01",
                "title": "Battery thermal anomaly",
                "subsystem": "POWER",
                "severity": "HIGH",
                "status": "INVESTIGATING",
                "confidence": 0.82,
                "detected_at": datetime(2026, 6, 24, 14, 32, 15),
                "description": "Battery pack cell temperature rose above 35°C threshold following elevated battery current excursion (18.7A). Telemetry correlated with FDIR power alert.",
                "telemetry_triggers": ["Battery Current", "Battery Temperature", "Power Load"]
            },
            {
                "id": "ANOM-003",
                "spacecraft_id": "SC-01",
                "title": "Communication packet transmission delay",
                "subsystem": "COMM",
                "severity": "MEDIUM",
                "status": "NEW",
                "confidence": 0.61,
                "detected_at": datetime(2026, 6, 24, 12, 18, 0),
                "description": "Downlink packet transmission latency increased to 1.2s with elevated internal FIFO queue depths during pass.",
                "telemetry_triggers": ["Communication Latency", "Signal Strength"]
            },
            {
                "id": "ANOM-002",
                "spacecraft_id": "SC-01",
                "title": "Thermal radiator loop temperature gradient",
                "subsystem": "THERMAL",
                "severity": "LOW",
                "status": "EVIDENCE_COLLECTED",
                "confidence": 0.74,
                "detected_at": datetime(2026, 6, 24, 9, 14, 0),
                "description": "Panel thermistor gradient exceeded 4.5°C during high beta angle solar traversal.",
                "telemetry_triggers": ["Radiator Temperature", "Thermal Margin"]
            },
            {
                "id": "ANOM-001",
                "spacecraft_id": "SC-01",
                "title": "Attitude pointing error excursion",
                "subsystem": "ATTITUDE",
                "severity": "MEDIUM",
                "status": "CLOSED",
                "confidence": 0.92,
                "detected_at": datetime(2026, 6, 24, 6, 47, 0),
                "description": "Pitch axis pointing error drifted to 0.14 degrees before desaturation was autonomously executed.",
                "telemetry_triggers": ["Attitude Error"]
            },
            {
                "id": "ANOM-000",
                "spacecraft_id": "SC-01",
                "title": "Payload science instrument bus voltage dip",
                "subsystem": "PAYLOAD",
                "severity": "LOW",
                "status": "CLOSED",
                "confidence": 0.88,
                "detected_at": datetime(2026, 6, 24, 2, 31, 0),
                "description": "Transient 0.8V dip during calibration spectrometer power-up. Returned to nominal within 350ms.",
                "telemetry_triggers": ["Power Load"]
            }
        ]

        for item in anomalies_data:
            anom = Anomaly(**item)
            db.add(anom)
        db.commit()

        # 6. Seed Evidence Items for ANOM-004 (matching image.png)
        evidence_data = [
            {
                "id": "EVID-001",
                "anomaly_id": "ANOM-004",
                "source_type": "telemetry",
                "source_id": "TEL-4821",
                "title": "Battery current exceeded upper threshold (18.7 A)",
                "subsystem": "POWER",
                "timestamp": datetime(2026, 6, 24, 14, 32, 15),
                "relevance": 0.96,
                "validation_status": "VALIDATED",
                "details": {
                    "parameter": "Battery Current",
                    "value": 18.7,
                    "expected_range": "15.0 - 17.0 A",
                    "unit": "A",
                    "status": "WARNING",
                    "delta": "+1.7 A above upper limit",
                    "chart_points": [
                        {"t": "14:20", "v": 16.0},
                        {"t": "14:25", "v": 16.3},
                        {"t": "14:30", "v": 17.6},
                        {"t": "14:32", "v": 18.7},
                        {"t": "14:35", "v": 18.5}
                    ]
                }
            },
            {
                "id": "EVID-002",
                "anomaly_id": "ANOM-004",
                "source_type": "telemetry",
                "source_id": "TEL-4830",
                "title": "Battery temperature reached high red threshold (38.2 °C)",
                "subsystem": "POWER",
                "timestamp": datetime(2026, 6, 24, 14, 32, 17),
                "relevance": 0.91,
                "validation_status": "VALIDATED",
                "details": {
                    "parameter": "Battery Temperature",
                    "value": 38.2,
                    "expected_range": "20.0 - 32.0 °C",
                    "unit": "°C",
                    "status": "CRITICAL",
                    "delta": "+6.2 °C above nominal threshold"
                }
            },
            {
                "id": "EVID-003",
                "anomaly_id": "ANOM-004",
                "source_type": "log",
                "source_id": "LOG-223",
                "title": "Battery thermal threshold warning log entry",
                "subsystem": "THERMAL",
                "timestamp": datetime(2026, 6, 24, 14, 32, 4),
                "relevance": 0.88,
                "validation_status": "VALIDATED",
                "details": {
                    "severity": "WARNING",
                    "message": "Battery thermal threshold warning: Cell pack temperature exceeded 35.0°C threshold (current: 38.2°C)."
                }
            },
            {
                "id": "EVID-004",
                "anomaly_id": "ANOM-004",
                "source_type": "procedure",
                "source_id": "PWR-204",
                "title": "Battery Thermal Investigation and Mitigation Procedure",
                "subsystem": "POWER",
                "timestamp": None,
                "relevance": 0.84,
                "validation_status": "VALIDATED",
                "details": {
                    "matched_steps": 5,
                    "primary_action": "Check bus load distribution and isolate secondary science heaters",
                    "safety_constraint": "Do NOT cycle relay while battery temp > 40°C"
                }
            },
            {
                "id": "EVID-005",
                "anomaly_id": "ANOM-004",
                "source_type": "incident",
                "source_id": "INC-102",
                "title": "Historical Incident: Battery thermal run-up during load spike",
                "subsystem": "POWER",
                "timestamp": datetime(2023, 11, 14, 10, 0, 0),
                "relevance": 0.78,
                "validation_status": "VALIDATED",
                "details": {
                    "similarity": 0.88,
                    "root_cause": "Unexpected secondary subsystem load on bus A",
                    "resolution": "Load shed commanded; temperature returned to nominal within 25 minutes"
                }
            },
            {
                "id": "EVID-006",
                "anomaly_id": "ANOM-004",
                "source_type": "log",
                "source_id": "LOG-220",
                "title": "Subsystem bus current step increase",
                "subsystem": "POWER",
                "timestamp": datetime(2026, 6, 24, 14, 30, 12),
                "relevance": 0.72,
                "validation_status": "VALIDATED",
                "details": {
                    "severity": "INFO",
                    "message": "Battery current increased from 15.8A to 18.7A. Secondary bus load increase detected."
                }
            },
            {
                "id": "EVID-007",
                "anomaly_id": "ANOM-004",
                "source_type": "log",
                "source_id": "LOG-224",
                "title": "FDIR warning - power subsystem excursion",
                "subsystem": "FDIR",
                "timestamp": datetime(2026, 6, 24, 14, 32, 15),
                "relevance": 0.89,
                "validation_status": "VALIDATED",
                "details": {
                    "severity": "WARNING",
                    "message": "FDIR warning - power subsystem: Bus current excursion threshold exceeded. Evaluating fault tree."
                }
            },
            {
                "id": "EVID-008",
                "anomaly_id": "ANOM-004",
                "source_type": "telemetry",
                "source_id": "TEL-4822",
                "title": "Power load reached 498W peak",
                "subsystem": "POWER",
                "timestamp": datetime(2026, 6, 24, 14, 32, 15),
                "relevance": 0.85,
                "validation_status": "VALIDATED",
                "details": {
                    "parameter": "Power Load",
                    "value": 498.0,
                    "expected_range": "380.0 - 440.0 W",
                    "unit": "W",
                    "status": "CRITICAL"
                }
            }
        ]

        for item in evidence_data:
            ev = EvidenceItem(**item)
            db.add(ev)
        db.commit()

        # 7. Seed Investigation for ANOM-004
        inv = Investigation(
            id="INV-004",
            anomaly_id="ANOM-004",
            spacecraft_id="SC-01",
            subsystem="POWER",
            status="IN_PROGRESS",
            confidence=0.82,
            summary="The battery temperature increase appears to be related to an elevated battery current (15.8A -> 18.7A), which preceded the temperature rise by 2 minutes. The concurrent power load surge to 498W and subsequent FDIR warning corroborate an unexpected bus load rather than cell internal degradation.",
            primary_hypothesis="Unintended secondary payload heater activation on Main Bus A caused continuous 18.7A current drain, generating +8°C Joule heating in battery enclosure.",
            alternative_hypotheses=[
                "Shunt regulator partial short-circuit preventing thermal dissipation.",
                "Battery internal cell separator high-resistance degradation.",
                "Thermal control loop louver stuck closed."
            ],
            root_cause_analysis="Telemetry correlation confirms that battery current rose at 14:30:12 UTC (+1.7A above max expected), followed 112 seconds later by battery temperature exceeding the 35.0°C safety envelope. This time lag matches thermal mass heat capacitance curves seen in historical incident INC-007 and INC-102.",
            key_findings={
                "observed_facts": 5,
                "inferences": 2,
                "recommendations": 3,
                "evidence": 8,
                "facts": [
                    "Battery Current stepped from 15.8A to 18.7A at 14:30:12 UTC (TEL-4821).",
                    "Battery Temperature crossed 35.0°C threshold at 14:32:04 UTC, peaking at 38.8°C (TEL-4830).",
                    "Power Load reached 498W, exceeding 440W upper boundary (TEL-4822).",
                    "FDIR Power subsystem fault flag asserted at 14:32:15 UTC (LOG-224).",
                    "Communication downlink packet delay reached 1.2s at 14:32:16 UTC (TEL-4824)."
                ]
            },
            next_steps=[
                "1. Check battery current and load distribution across Bus A and Bus B.",
                "2. Compare with expected ranges and verify shunt regulator status.",
                "3. Review procedure PWR-204 for step-by-step load shed protocol.",
                "4. Check similar historical incidents INC-007 and INC-102 for recovery precedent."
            ],
            recommendations=[
                {
                    "step": 1,
                    "action": "Execute Diagnostic Verification: Query PDU branch telemetry for Payload Bus 2.",
                    "type": "DIAGNOSTIC",
                    "urgency": "IMMEDIATE",
                    "safety_note": "Non-destructive read-only telemetry poll."
                },
                {
                    "step": 2,
                    "action": "Execute Procedure PWR-204 Step 5: Command load shed of secondary science heater string.",
                    "type": "RECOVERY",
                    "urgency": "HIGH",
                    "safety_note": "CRITICAL: Do NOT cycle main battery relay while temperature is > 35°C."
                },
                {
                    "step": 3,
                    "action": "Monitor thermal slope for 15 minutes post-shedding to confirm cooling below 32°C.",
                    "type": "VERIFICATION",
                    "urgency": "MEDIUM",
                    "safety_note": "Ensure continuous S-band carrier lock."
                }
            ],
            safety_boundaries=[
                "CRITICAL: Do NOT execute main relay switching while battery cell temperature is above 40°C.",
                "SAFETY GUARD: Maintain continuous S-band downlink lock before altering charge regulator modes.",
                "SIMULATION ONLY: Real spacecraft commanding is disabled. This is a decision-support advisory system only."
            ],
            telemetry_correlations=[
                {
                    "param_a": "Battery Current",
                    "param_b": "Battery Temperature",
                    "correlation_coefficient": 0.89,
                    "time_lag_seconds": 112,
                    "significance": "HIGH",
                    "relationship": "Leading indicator (Current leads Temperature by ~2 min)"
                },
                {
                    "param_a": "Power Load",
                    "param_b": "Battery Current",
                    "correlation_coefficient": 0.97,
                    "time_lag_seconds": 0,
                    "significance": "HIGH",
                    "relationship": "Synchronous direct coupling"
                },
                {
                    "param_a": "Battery Voltage",
                    "param_b": "Battery Current",
                    "correlation_coefficient": -0.84,
                    "time_lag_seconds": 0,
                    "significance": "HIGH",
                    "relationship": "Inverse coupling (Ohmic load droop)"
                }
            ],
            historical_matches=[
                {
                    "id": "INC-007",
                    "title": "Battery temperature increase associated with temporary power-load spike",
                    "similarity": 0.94,
                    "subsystem": "POWER",
                    "past_resolution": "Secondary payload heater load shed commanded; temperature returned to nominal baseline within 25 minutes.",
                    "relevance_notes": "Identical current step profile (15.5A -> 18.9A) and thermal slope (+0.65°C/min)."
                },
                {
                    "id": "INC-102",
                    "title": "Battery thermal run-up during load spike and telemetry latency",
                    "similarity": 0.88,
                    "subsystem": "POWER",
                    "past_resolution": "Shed high-draw instrument circuits and recalibrated charge control threshold.",
                    "relevance_notes": "Matching concurrent packet delay and bus voltage depression."
                }
            ],
            applicable_procedures=[
                {
                    "id": "PWR-204",
                    "title": "Battery Thermal Investigation and Mitigation Procedure",
                    "subsystem": "POWER",
                    "confidence": 0.95,
                    "rationale": "Directly addresses battery temperature excursions above 35°C with current spikes.",
                    "recommended_action": "Execute Step 1 through Step 5 under procedure guidelines."
                },
                {
                    "id": "FDIR-001",
                    "title": "Autonomous FDIR Warning and Threshold Response",
                    "subsystem": "POWER",
                    "confidence": 0.86,
                    "rationale": "Correlates with LOG-224 FDIR power fault flag.",
                    "recommended_action": "Verify autonomous fault response limits before overriding."
                }
            ],
            supporting_evidence=[
                {"id": "TEL-4821", "description": "Battery current: 18.7A (expected 15-17A)", "type": "telemetry"},
                {"id": "TEL-4830", "description": "Battery temperature +8°C (reached 38.2°C)", "type": "telemetry"},
                {"id": "LOG-223", "description": "FDIR warning (power subsystem / thermal threshold)", "type": "log"},
                {"id": "PWR-204", "description": "Relevant procedure for thermal mitigation", "type": "procedure"}
            ],
            contradicting_evidence=[],
            timeline_events=[
                {"time": "14:30:12", "event": "Battery current increased from 15.8A to 18.7A", "source": "Telemetry", "subsystem": "POWER"},
                {"time": "14:32:04", "event": "Battery temperature exceeded threshold (35°C)", "source": "Log", "subsystem": "THERMAL"},
                {"time": "14:32:15", "event": "FDIR warning - power subsystem", "source": "Log", "subsystem": "FDIR"},
                {"time": "14:32:16", "event": "Packet transmission delayed by 1.2s", "source": "Log", "subsystem": "COMM"},
                {"time": "14:33:02", "event": "Similar incident INC-102 found", "source": "RAG", "subsystem": "SYSTEM"},
                {"time": "14:33:15", "event": "Correlation analysis completed", "source": "System", "subsystem": "SYSTEM"},
                {"time": "14:33:42", "event": "Investigation generated", "source": "AI Copilot", "subsystem": "AI"}
            ],
            llm_metadata={
                "provider": settings.LLM_PROVIDER,
                "model": settings.LLM_MODEL,
                "tokens": 1420,
                "latency_ms": 185,
                "mode": "GROUNDED_DECISION_SUPPORT"
            }
        )
        db.add(inv)
        db.commit()

        # 8. Seed Audit Trail (matching image.png Panel 7)
        audit_records = [
            {
                "id": "AUD-001",
                "timestamp": datetime(2026, 6, 24, 8, 42, 10),
                "actor": "Operator",
                "action": "Opened investigation",
                "object_id": "ANOM-004",
                "evidence_ref": "-",
                "result": "Success",
                "details": {"client": "Mission Console Web", "operator": "flight_controller_1"}
            },
            {
                "id": "AUD-002",
                "timestamp": datetime(2026, 6, 24, 8, 42, 14),
                "actor": "System",
                "action": "RAG retrieval executed",
                "object_id": "-",
                "evidence_ref": "8 sources",
                "result": "Success",
                "details": {"vector_store": "ChromaDB", "retrieved_count": 8}
            },
            {
                "id": "AUD-003",
                "timestamp": datetime(2026, 6, 24, 8, 42, 15),
                "actor": "System",
                "action": "Retrieved telemetry",
                "object_id": "TEL-4821",
                "evidence_ref": "-",
                "result": "Success",
                "details": {"parameter": "Battery Current", "value": 18.7}
            },
            {
                "id": "AUD-004",
                "timestamp": datetime(2026, 6, 24, 8, 42, 16),
                "actor": "System",
                "action": "Retrieved procedure",
                "object_id": "PWR-204",
                "evidence_ref": "-",
                "result": "Success",
                "details": {"procedure_title": "Battery Thermal Investigation and Mitigation"}
            },
            {
                "id": "AUD-005",
                "timestamp": datetime(2026, 6, 24, 8, 42, 19),
                "actor": "AI Copilot",
                "action": "Investigation generated",
                "object_id": "ANOM-004",
                "evidence_ref": "8 evidence",
                "result": "Success",
                "details": {"confidence": 0.82, "hypotheses_count": 4}
            },
            {
                "id": "AUD-006",
                "timestamp": datetime(2026, 6, 24, 8, 42, 21),
                "actor": "Operator",
                "action": "Viewed recommendation",
                "object_id": "ANOM-004",
                "evidence_ref": "-",
                "result": "Success",
                "details": {"recommendation_reviewed": "PWR-204 Step 5"}
            }
        ]

        for item in audit_records:
            aud = AuditEvent(**item)
            db.add(aud)
        db.commit()

        print("Database successfully seeded with mission operations datasets.")
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_database()
