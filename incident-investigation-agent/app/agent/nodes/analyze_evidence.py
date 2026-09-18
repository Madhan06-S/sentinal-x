from __future__ import annotations

import json
import logging
import time
from typing import Any

from app.agent.prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE
from app.llm.groq_client import GroqClient, GroqNotConfiguredError
from app.schemas.incident import IncidentRequest
from app.security import sanitize_error

logger = logging.getLogger(__name__)


def _compact(data: Any, limit: int = 12000) -> str:
    text = json.dumps(data, default=str)
    if len(text) > limit:
        return text[: limit - 3] + "..."
    return text


async def analyze_evidence(state: dict[str, Any]) -> dict[str, Any]:
    started = time.perf_counter()
    incident = IncidentRequest.model_validate(state["incident"])
    client = GroqClient()
    if not client.configured():
        logger.info(
            "groq unavailable",
            extra={
                "investigation_id": state.get("investigation_id"),
                "incident_id": incident.incident_id,
                "node": "analyze_evidence",
                "source": "groq",
                "duration_ms": round((time.perf_counter() - started) * 1000, 2),
                "success": False,
            },
        )
        return {
            "llm_analysis": {"status": "unavailable", "error": "GROQ_API_KEY is not configured"},
            "sources": [{"source": "groq", "status": "unavailable", "error": "GROQ_API_KEY is not configured"}],
            "uncertainties": ["LLM reasoning was skipped because Groq is not configured."],
        }

    user = USER_PROMPT_TEMPLATE.format(
        incident=_compact(state.get("incident")),
        sources=_compact(state.get("sources")),
        correlations=_compact(state.get("correlations")),
        backtracking_path=_compact(state.get("backtracking_path")),
        candidates=_compact(state.get("candidate_causes")),
        evidence=_compact(state.get("evidence")),
    )
    try:
        analysis = await client.complete_json(system=SYSTEM_PROMPT, user=user)
        analysis["status"] = "ok"
        logger.info(
            "analyze_evidence complete",
            extra={
                "investigation_id": state.get("investigation_id"),
                "incident_id": incident.incident_id,
                "node": "analyze_evidence",
                "source": "groq",
                "duration_ms": round((time.perf_counter() - started) * 1000, 2),
                "success": True,
            },
        )
        return {
            "llm_analysis": analysis,
            "sources": [{"source": "groq", "status": "ok"}],
        }
    except GroqNotConfiguredError:
        return {
            "llm_analysis": {"status": "unavailable", "error": "GROQ_API_KEY is not configured"},
            "sources": [{"source": "groq", "status": "unavailable", "error": "GROQ_API_KEY is not configured"}],
            "uncertainties": ["LLM reasoning was skipped because Groq is not configured."],
        }
    except Exception as exc:
        error = sanitize_error(exc)
        logger.info(
            "analyze_evidence failed",
            extra={
                "investigation_id": state.get("investigation_id"),
                "incident_id": incident.incident_id,
                "node": "analyze_evidence",
                "source": "groq",
                "duration_ms": round((time.perf_counter() - started) * 1000, 2),
                "success": False,
            },
        )
        return {
            "llm_analysis": {"status": "error", "error": error},
            "sources": [{"source": "groq", "status": "error", "error": error}],
            "errors": [{"source": "groq", "error": error}],
            "uncertainties": ["LLM reasoning failed; RCA is based on deterministic scoring only."],
        }
