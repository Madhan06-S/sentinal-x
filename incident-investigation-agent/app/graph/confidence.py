from __future__ import annotations

from typing import Any

from app.schemas.evidence import CandidateCause, CorrelationLink, EvidenceItem, SourceResult


METHODOLOGY = {
    "name": "evidence-weighted confidence",
    "description": (
        "Deterministic score from independent sources, temporal/service correlation, "
        "deployment and Kubernetes support, minus missing and contradictory evidence. "
        "LLM confidence is accepted only if it does not exceed the evidence ceiling."
    ),
    "weights": {
        "independent_sources": 0.28,
        "temporal_correlation": 0.18,
        "dependency_or_service": 0.14,
        "metric_support": 0.14,
        "deployment_support": 0.10,
        "kubernetes_support": 0.10,
        "contradiction_penalty": 0.20,
        "missing_source_penalty": 0.08,
    },
    "llm_policy": "final = min(llm_confidence, deterministic + 0.12); never above 0.95",
}


def _sources(evidence: list[EvidenceItem]) -> set[str]:
    return {item.source for item in evidence}


def score_candidate(
    candidate: CandidateCause,
    evidence: list[EvidenceItem],
    correlations: list[CorrelationLink],
    source_results: list[SourceResult],
) -> float:
    by_id = {item.id: item for item in evidence}
    supporting = [by_id[eid] for eid in candidate.supporting_evidence if eid in by_id]
    contradicting = [by_id[eid] for eid in candidate.contradicting_evidence if eid in by_id]
    if not supporting:
        return 0.05

    source_count = len(_sources(supporting))
    independent = min(source_count / 3.0, 1.0)

    related_ids = set(candidate.supporting_evidence)
    temporal = 0.0
    service_link = 0.0
    for link in correlations:
        if link.left_id in related_ids and link.right_id in related_ids:
            if "temporal" in link.reason:
                temporal = max(temporal, link.score)
            if "service" in link.reason or "related_service" in link.reason:
                service_link = max(service_link, link.score)
    if candidate.metadata.get("on_backtrack_path"):
        service_link = max(service_link, 0.6)

    types = {item.type for item in supporting}
    metric_support = 1.0 if "metric" in types else 0.0
    deployment_support = 1.0 if "deployment" in types or "commit" in types else 0.0
    kubernetes_support = 1.0 if "kubernetes_event" in types or any(item.source == "kubernetes" for item in supporting) else 0.0

    missing = [item for item in source_results if item.status != "ok"]
    missing_penalty = min(len(missing) * 0.08, 0.32)
    contradiction_penalty = min(len(contradicting) * 0.15, 0.45)

    score = (
        0.28 * independent
        + 0.18 * temporal
        + 0.14 * service_link
        + 0.14 * metric_support
        + 0.10 * deployment_support
        + 0.10 * kubernetes_support
        + 0.12
    )
    score -= contradiction_penalty
    score -= missing_penalty
    return round(min(max(score, 0.05), 0.95), 4)


def blend_confidence(deterministic: float, llm_confidence: float | None) -> float:
    if llm_confidence is None:
        return deterministic
    llm = min(max(llm_confidence, 0.0), 1.0)
    ceiling = min(deterministic + 0.12, 0.95)
    return round(min(llm, ceiling), 4)


def apply_scores(
    candidates: list[CandidateCause],
    evidence: list[EvidenceItem],
    correlations: list[CorrelationLink],
    source_results: list[SourceResult],
) -> list[CandidateCause]:
    scored: list[CandidateCause] = []
    for candidate in candidates:
        det = score_candidate(candidate, evidence, correlations, source_results)
        candidate.deterministic_score = det
        candidate.confidence = det
        scored.append(candidate)
    scored.sort(key=lambda item: item.confidence, reverse=True)
    return scored
