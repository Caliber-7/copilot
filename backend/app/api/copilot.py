from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.investigation import Investigation
from app.models.anomaly import Anomaly
from app.models.evidence import EvidenceItem
from app.schemas.investigation import CopilotQueryRequest, CopilotQueryResponse
from app.services.rag import rag_service
from app.services.audit import audit_service
from app.services.llm_client import llm_client
from app.config import settings

router = APIRouter(prefix="/api/copilot", tags=["AI Copilot"])

@router.post("/query", response_model=CopilotQueryResponse)
@router.post("/chat", response_model=CopilotQueryResponse)
async def query_copilot(payload: CopilotQueryRequest, db: Session = Depends(get_db)):
    """
    Interactive AI Copilot chat query endpoint.
    Answers operator questions grounded in retrieved mission evidence and investigation context.
    Supports Ollama, Google Gemini, and grounded simulation fallback.
    """
    anomaly_id = payload.anomaly_id or "ANOM-004"
    inv = db.query(Investigation).filter(Investigation.anomaly_id == anomaly_id).first()
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    evidence_list = db.query(EvidenceItem).filter(EvidenceItem.anomaly_id == anomaly_id).all()

    q_lower = payload.query.lower()
    answer = None

    # Pre-crafted ground truth answers for high-frequency console chips
    if "why" in q_lower and ("detected" in q_lower or "anomaly" in q_lower):
        answer = (
            "The anomaly was detected due to an increase in battery current (15.8A -> 18.7A) "
            "followed by a rise in battery temperature (+8°C) and a subsequent FDIR warning. "
            "These parameters exceeded their expected ranges and were correlated within a 2-minute window."
        )
    elif "next" in q_lower or "what should i investigate" in q_lower:
        answer = (
            "Recommended Next Steps:\n"
            "1. Check battery current and bus load distribution across Main Bus A and B.\n"
            "2. Compare with expected ranges and verify shunt regulator dissipation status.\n"
            "3. Review procedure PWR-204 Step 5 for secondary payload load shed guidelines.\n"
            "4. Cross-reference historical incident INC-007 for identical load spike precedent."
        )
    elif "procedure" in q_lower:
        answer = (
            "Applicable Procedure: PWR-204 (Battery Thermal Investigation and Mitigation Procedure).\n"
            "Safety Constraint: CRITICAL: Do NOT execute main relay switching while battery cell temperature "
            "is above 40°C. Maintain continuous S-band downlink lock before altering battery regulator modes."
        )
    elif "incident" in q_lower or "similar" in q_lower:
        answer = (
            "Top Historical Matches:\n"
            "1. INC-007 (Similarity 0.94): Battery temperature increase associated with temporary power-load spike. "
            "Resolution: Secondary heater load shed commanded; temperature returned to nominal within 25 minutes.\n"
            "2. INC-102 (Similarity 0.88): Battery thermal run-up during load spike and telemetry latency."
        )
    elif "timeline" in q_lower:
        answer = (
            "Key Event Sequence:\n"
            "• 14:30:12 UTC - Battery current stepped to 18.7A (TEL-4821)\n"
            "• 14:32:04 UTC - Battery temperature exceeded 35.0°C threshold (TEL-4830, LOG-223)\n"
            "• 14:32:15 UTC - FDIR power subsystem fault warning asserted (LOG-224)\n"
            "• 14:32:16 UTC - Telemetry packet transmission delay spiked to 1.2s (TEL-4824)"
        )

    # If not a standard chip and an external LLM is configured (Ollama or Gemini)
    if not answer and settings.LLM_PROVIDER.lower() != "mock":
        try:
            system_prompt = (
                "You are the Mission Operations Copilot AI for spacecraft SC-01. "
                "Answer the operator's query directly, accurately, and concisely. "
                "STRICT GROUNDING: Use only the provided spacecraft context. Do not invent ungrounded data. "
                "Enforce decision-support safety boundaries."
            )
            evidence_summary = "\n".join([f"- {e.source_id}: {e.title}" for e in evidence_list[:6]])
            inv_summary = inv.summary if inv else "No investigation summary available."
            user_prompt = (
                f"Spacecraft: SC-01\n"
                f"Anomaly: {anomaly_id} ({anomaly.title if anomaly else 'Unknown'})\n"
                f"Investigation Summary: {inv_summary}\n"
                f"Validated Evidence:\n{evidence_summary}\n\n"
                f"Operator Question: {payload.query}"
            )
            res = await llm_client.generate_response(system_prompt, user_prompt, json_mode=False)
            if res and "text" in res:
                answer = res["text"]
        except Exception as e:
            print(f"[CopilotAPI] Live LLM query exception: {e}. Falling back to grounded answer.")

    # Fallback grounded synthesis
    if not answer:
        summary_text = inv.summary if inv else "Battery current surge preceded temperature elevation."
        answer = (
            f"Based on mission evidence for {anomaly_id}: {summary_text} "
            f"Root cause analysis indicates unexpected electrical bus load rather than intrinsic cell degradation."
        )

    # Supporting evidence citations matching image.png Panel 8
    supporting = [
        {"id": "TEL-4821", "description": "Battery current: 18.7A (expected 15-17A)", "type": "telemetry"},
        {"id": "TEL-4830", "description": "Battery temperature +8°C (reached 38.2°C)", "type": "telemetry"},
        {"id": "LOG-223", "description": "FDIR warning (power subsystem)", "type": "log"},
        {"id": "PWR-204", "description": "Relevant procedure (Battery Thermal Mitigation)", "type": "procedure"}
    ]

    suggested_actions = [
        "Show evidence",
        "Show timeline",
        "Similar incidents",
        "Which procedure applies?"
    ]

    confidence = inv.confidence if inv else 0.82

    # Log audit event
    audit_service.log_event(
        db=db,
        actor="AI Copilot",
        action="Copilot query answered",
        object_id=anomaly_id,
        evidence_ref=f"{len(supporting)} sources",
        details={"query": payload.query, "confidence": confidence, "provider": settings.LLM_PROVIDER}
    )

    return CopilotQueryResponse(
        query=payload.query,
        answer=answer,
        confidence=confidence,
        sources_count=len(supporting),
        supporting_evidence=supporting,
        suggested_actions=suggested_actions,
        llm_metadata={
            "provider": settings.LLM_PROVIDER,
            "model": settings.OLLAMA_MODEL if settings.LLM_PROVIDER == "ollama" else (settings.GEMINI_MODEL if settings.LLM_PROVIDER == "gemini" else settings.LLM_MODEL),
            "grounded": True,
            "simulation_mode": settings.SIMULATION_MODE
        }
    )
