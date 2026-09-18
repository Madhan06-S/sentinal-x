from __future__ import annotations

import logging
import time
from datetime import datetime, timezone
from typing import Any

from app.graph.confidence import METHODOLOGY, blend_confidence
from app.schemas.evidence import CandidateCause, EvidenceItem, SourceResult
from app.schemas.incident import IncidentRequest
from app.schemas.rca import RCAResponse, RootCause

logger = logging.getLogger(__name__)


def _known_ids(evidence: list[EvidenceItem]) -> set[str]:
    return {item.id for item in evidence}


def _filter_ids(ids: list[Any], known: set[str]) -> list[str]:
    return [str(item) for item in ids if str(item) in known]


def _dedupe_sources(sources: list[SourceResult]) -> list[SourceResult]:
    rank = {"error": 3, "unavailable": 2, "ok": 1}
    best: dict[str, SourceResult] = {}
    for item in sources:
        current = best.get(item.source)
        if current is None or rank.get(item.status, 0) >= rank.get(current.status, 0):
            best[item.source] = item
    return list(best.values())


async def generate_rca(state: dict[str, Any]) -> dict[str, Any]:
    started = time.perf_counter()
    incident = IncidentRequest.model_validate(state["incident"])
    evidence = [EvidenceItem.model_validate(item) for item in state.get("evidence") or []]
    known = _known_ids(evidence)
    candidates = [CandidateCause.model_validate(item) for item in state.get("candidate_causes") or []]
    sources = _dedupe_sources([SourceResult.model_validate(item) for item in state.get("sources") or []])
    analysis = state.get("llm_analysis") or {}
    missing_sources = [item for item in sources if item.status != "ok"]

    uncertainties = list(state.get("uncertainties") or [])
    if analysis.get("status") != "ok":
        if analysis.get("error"):
            uncertainties.append(f"LLM analysis {analysis.get('status')}: {analysis.get('error')}")
    uncertainties.extend(analysis.get("uncertainties") or [])
    uncertainties.extend(analysis.get("missing_information") or [])
    for source in missing_sources:
        uncertainties.append(f"{source.source} evidence is {source.status}" + (f": {source.error}" if source.error else ""))

    best = candidates[0] if candidates else None
    best_id = analysis.get("best_candidate_id") if analysis.get("status") == "ok" else None
    if best_id:
        match = next((item for item in candidates if item.id == best_id), None)
        if match:
            best = match
    if best and analysis.get("status") == "ok":
        support = _filter_ids(analysis.get("supporting_evidence_ids") or [], known)
        contra = _filter_ids(analysis.get("contradicting_evidence_ids") or [], known)
        if support:
            best.supporting_evidence = list(dict.fromkeys([*best.supporting_evidence, *support]))
        if contra:
            best.contradicting_evidence = list(dict.fromkeys([*best.contradicting_evidence, *contra]))

    llm_confidence = analysis.get("llm_confidence") if analysis.get("status") == "ok" else None
    try:
        llm_confidence = float(llm_confidence) if llm_confidence is not None else None
    except (TypeError, ValueError):
        llm_confidence = None
    deterministic = best.deterministic_score if best and best.deterministic_score is not None else (best.confidence if best else 0.05)
    if not evidence:
        deterministic = min(deterministic, 0.15)
    final_confidence = blend_confidence(deterministic, llm_confidence)

    summary = None
    if analysis.get("status") == "ok":
        summary = analysis.get("root_cause_summary") or analysis.get("what_happened")
    if not summary and best:
        summary = best.cause
    if not summary:
        summary = "Insufficient operational evidence to determine a probable root cause."
        uncertainties.append("No evidence-backed root cause could be established.")

    if analysis.get("status") == "ok":
        invented = [
            eid
            for eid in (analysis.get("supporting_evidence_ids") or [])
            if str(eid) not in known
        ]
        if invented:
            uncertainties.append("LLM cited evidence IDs that were not collected; those IDs were discarded.")

    affected = []
    if incident.service:
        affected.append(incident.service)
    affected.extend(incident.related_services)
    if isinstance(analysis.get("affected_services"), list):
        affected.extend(str(item) for item in analysis["affected_services"] if item)
    affected = list(dict.fromkeys(affected))

    next_step = None
    if analysis.get("status") == "ok":
        next_step = analysis.get("recommended_next_investigation")
    if not next_step and missing_sources:
        names = ", ".join(sorted({item.source for item in missing_sources}))
        next_step = f"Collect missing evidence from: {names}"

    status = "completed"
    if missing_sources or analysis.get("status") != "ok":
        status = "completed_with_gaps"
    if not evidence and analysis.get("status") != "ok":
        status = "completed_with_gaps"

    end = datetime.now(timezone.utc)
    rca = RCAResponse(
        investigation_id=state["investigation_id"],
        incident_id=incident.incident_id,
        status=status,
        root_cause=RootCause(
            summary=summary,
            confidence=final_confidence,
            candidate_id=best.id if best else None,
        ),
        affected_services=affected,
        evidence=evidence,
        candidate_causes=candidates,
        backtracking_path=state.get("backtracking_path") or [],
        uncertainties=list(dict.fromkeys(uncertainties)),
        recommended_next_investigation=next_step,
        sources=sources,
        correlations=state.get("correlations") or [],
        confidence_methodology={
            **METHODOLOGY,
            "deterministic_score": deterministic,
            "llm_confidence": llm_confidence,
            "final_confidence": final_confidence,
        },
        investigation_start=state.get("investigation_start"),
        investigation_end=end,
        errors=state.get("errors") or [],
    )
    logger.info(
        "generate_rca complete",
        extra={
            "investigation_id": state.get("investigation_id"),
            "incident_id": incident.incident_id,
            "node": "generate_rca",
            "duration_ms": round((time.perf_counter() - started) * 1000, 2),
            "success": True,
            "status": status,
            "evidence_count": len(evidence),
        },
    )
    payload = rca.model_dump(mode="json")
    return {
        "rca": payload,
        "root_cause": payload.get("root_cause"),
        "confidence": final_confidence,
        "status": status,
        "uncertainties": payload.get("uncertainties"),
        "investigation_end": end.isoformat(),
    }
