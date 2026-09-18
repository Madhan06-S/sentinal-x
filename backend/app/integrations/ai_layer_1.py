import httpx
from app.core.config import settings
from app.core.logging import logger
from app.schemas.schemas import AIAnalysisRequest, AIAnalysisResponse, Hypothesis
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import httpx


def _should_mock() -> bool:
    return settings.AI_LAYER_1_MOCK


def _mock_analysis(payload: AIAnalysisRequest) -> AIAnalysisResponse:
    correlated = [alert["id"] for alert in payload.alerts]
    services = {alert.get("service") for alert in payload.alerts}
    deployments = payload.deployments
    latest_deploy = deployments[0] if deployments else None
    root_service = latest_deploy.get("service") if latest_deploy else next(iter(services), "payment-service")

    evidence = [
        {
            "type": "timeline",
            "description": "Deployment occurred shortly before the first customer-impacting alert.",
            "supported": True,
        },
        {
            "type": "metrics",
            "description": "Database connections and memory usage increased after the deployment.",
            "supported": True,
        },
        {
            "type": "dependency",
            "description": "Payment API timeouts followed database saturation.",
            "supported": True,
        },
    ]
    hypotheses = [
        Hypothesis(
            statement=f"Recent {root_service} deployment caused excessive DB connections.",
            supported=True,
            confidence=0.94,
            evidence=evidence,
        )
    ]
    graph = payload.dependency_graph or {
        "nodes": [{"id": name, "label": name, "type": "service"} for name in services],
        "edges": [],
    }
    return AIAnalysisResponse(
        incident_id=payload.incident_id,
        correlated_alert_ids=correlated,
        root_cause=f"Recent {root_service} deployment {latest_deploy.get('version') if latest_deploy else ''} caused a memory spike and database connection exhaustion.".strip(),
        confidence=0.94,
        evidence=evidence,
        hypotheses=hypotheses,
        dependency_graph=graph,
        analysis_summary="Backtracking from payment failures to API timeouts, database overload, and a recent payment-service deployment.",
        fingerprint={
            "alert_types": sorted({a.get("alert_type") for a in payload.alerts}),
            "services": sorted(s for s in services if s),
            "root_cause_class": "bad_deployment",
        },
    )


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError)),
    reraise=True,
)
async def _analyze_incident_http(payload: AIAnalysisRequest) -> AIAnalysisResponse:
    async with httpx.AsyncClient(timeout=settings.AI_HTTP_TIMEOUT_SECONDS) as client:
        response = await client.post(
            f"{settings.AI_LAYER_1_URL.rstrip('/')}/analyze",
            json=payload.model_dump(mode="json"),
        )
        response.raise_for_status()
        return AIAnalysisResponse(**response.json())


async def analyze_incident(payload: AIAnalysisRequest) -> AIAnalysisResponse:
    logger.info("Sending incident %s to AI Layer 1", payload.incident_id)
    if _should_mock():
        logger.info("Using simulated AI Layer 1 response")
        return _mock_analysis(payload)

    try:
        return await _analyze_incident_http(payload)
    except Exception as exc:
        logger.error("AI Layer 1 failed after retries: %s", exc)
        raise
