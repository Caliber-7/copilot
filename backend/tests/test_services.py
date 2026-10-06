import pytest
from app.services.correlation import TelemetryCorrelationService
from app.services.confidence import ConfidenceService
from app.services.rag import RAGService
from app.models.evidence import EvidenceItem
from app.schemas.telemetry import CorrelationPair

def test_telemetry_correlation_math():
    x = [10.0, 12.0, 14.0, 16.0, 18.0]
    y = [20.0, 24.0, 28.0, 32.0, 36.0]
    r = TelemetryCorrelationService.calculate_pearson(x, y)
    assert r == 1.0

    # Inverse correlation
    y_inv = [36.0, 32.0, 28.0, 24.0, 20.0]
    r_inv = TelemetryCorrelationService.calculate_pearson(x, y_inv)
    assert r_inv == -1.0

def test_confidence_service_calculation():
    dummy_evidence = [
        EvidenceItem(id="E1", source_type="telemetry", source_id="T1", title="Current Spike", subsystem="POWER", validation_status="VALIDATED"),
        EvidenceItem(id="E2", source_type="log", source_id="L1", title="Alarm Log", subsystem="POWER", validation_status="VALIDATED"),
        EvidenceItem(id="E3", source_type="procedure", source_id="P1", title="Procedure", subsystem="POWER", validation_status="VALIDATED"),
        EvidenceItem(id="E4", source_type="incident", source_id="I1", title="Past Incident", subsystem="POWER", validation_status="VALIDATED"),
    ]
    corrs = [
        CorrelationPair(param_a="Current", param_b="Temp", correlation_coefficient=0.88, time_lag_seconds=112, significance="HIGH", relationship="Leading")
    ]
    historical = [{"id": "INC-007", "similarity": 0.92}]
    procedures = [{"id": "PWR-204", "confidence": 0.90}]

    score, breakdown = ConfidenceService.calculate_confidence(
        dummy_evidence, corrs, historical, procedures
    )
    assert 0.70 <= score <= 0.99
    assert "evidence_quality" in breakdown
    assert "composite" in breakdown

def test_rag_fallback_indexing_and_retrieval():
    rag = RAGService()
    rag.index_document(
        doc_id="TEST-PROC-1",
        text="Battery thermal runaway contingency procedures for power subsystem.",
        metadata={"title": "Battery Thermal", "subsystem": "POWER", "doc_type": "procedure"}
    )
    rag.index_document(
        doc_id="TEST-PROC-2",
        text="Reaction wheel desaturation using magnetic torque coils.",
        metadata={"title": "RW Desaturation", "subsystem": "ATTITUDE", "doc_type": "procedure"}
    )

    results = rag.query("battery thermal power spike", n_results=1)
    assert len(results) > 0
    assert results[0]["id"] == "TEST-PROC-1"
