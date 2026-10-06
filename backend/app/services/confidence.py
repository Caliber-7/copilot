from typing import List, Dict, Any, Tuple
from app.models.evidence import EvidenceItem
from app.schemas.telemetry import CorrelationPair

class ConfidenceService:
    @staticmethod
    def calculate_confidence(
        evidence_items: List[EvidenceItem],
        correlations: List[CorrelationPair],
        historical_matches: List[Dict[str, Any]],
        procedure_matches: List[Dict[str, Any]]
    ) -> Tuple[float, Dict[str, float]]:
        """
        Calculates a grounded multi-factor confidence score for the investigation:
        - Evidence Quality & Diversity (35%)
        - Telemetry Correlation Strength (25%)
        - Historical Incident Alignment (20%)
        - Procedure Applicability (20%)
        """
        # 1. Evidence Quality & Diversity
        validated_items = [e for e in evidence_items if e.validation_status == "VALIDATED"]
        types_represented = {e.source_type for e in validated_items}
        diversity_score = min(1.0, len(types_represented) / 4.0) # telemetry, log, procedure, incident
        count_score = min(1.0, len(validated_items) / 6.0)
        evidence_factor = (diversity_score * 0.6) + (count_score * 0.4)

        # 2. Telemetry Correlation Strength
        if correlations:
            high_corrs = [c for c in correlations if c.significance == "HIGH"]
            corr_factor = min(1.0, 0.5 + (len(high_corrs) * 0.25))
        else:
            corr_factor = 0.60

        # 3. Historical Incident Alignment
        if historical_matches:
            top_sim = max([m.get("similarity", 0.5) for m in historical_matches])
            historical_factor = min(1.0, top_sim)
        else:
            historical_factor = 0.50

        # 4. Procedure Applicability
        if procedure_matches:
            top_proc = max([p.get("confidence", p.get("similarity", 0.6)) for p in procedure_matches])
            procedure_factor = min(1.0, top_proc)
        else:
            procedure_factor = 0.55

        # Weighted Composite
        composite = (
            evidence_factor * 0.35 +
            corr_factor * 0.25 +
            historical_factor * 0.20 +
            procedure_factor * 0.20
        )

        final_score = round(min(0.98, max(0.40, composite)), 2)

        breakdown = {
            "evidence_quality": round(evidence_factor, 2),
            "telemetry_correlation": round(corr_factor, 2),
            "historical_alignment": round(historical_factor, 2),
            "procedure_applicability": round(procedure_factor, 2),
            "composite": final_score
        }

        return final_score, breakdown

confidence_service = ConfidenceService()
