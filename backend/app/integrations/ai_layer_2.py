import httpx
from app.core.config import settings
from app.core.logging import logger
from app.models.models import RiskLevel
from app.schemas.schemas import AIDecisionRequest, AIDecisionResponse, AIVerificationRequest, AIVerificationResponse
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import httpx


def _should_mock() -> bool:
    return settings.AI_LAYER_2_MOCK


def _mock_decision(payload: AIDecisionRequest) -> AIDecisionResponse:
    action_names = [item["action"] if isinstance(item, dict) else item for item in payload.available_actions]
    decision = "ROLLBACK_DEPLOYMENT" if "ROLLBACK_DEPLOYMENT" in action_names and payload.confidence >= 0.8 else "SCALE_SERVICE"
    return AIDecisionResponse(
        incident_id=payload.incident_id,
        decision=decision,
        risk_level=RiskLevel.MEDIUM if decision == "ROLLBACK_DEPLOYMENT" else RiskLevel.LOW,
        approval_required=decision == "ROLLBACK_DEPLOYMENT",
        reason="Recent deployment strongly correlates with incident onset and customer-facing payment failures.",
        action_parameters={
            "service": "payment-service",
            "version": "v2.4.0",
            "current_version": "v2.4.1",
        },
        business_impact={
            "affected_services": ["payment-service", "api-gateway", "postgres-primary"],
            "affected_business_functions": ["Checkout", "Customer Transactions"],
            "customer_impact": "Payment failures at checkout",
            "severity": payload.severity,
        },
        verification_checks=["api_error_rate", "db_connections", "latency", "payment_failures"],
    )


def _mock_verification(payload: AIVerificationRequest) -> AIVerificationResponse:
    return AIVerificationResponse(
        incident_id=payload.incident_id,
        healthy=True,
        summary="Error rate, database connections, latency, and payment failures returned to baseline.",
        checks=[
            {"name": "api_error_rate", "passed": True},
            {"name": "db_connections", "passed": True},
            {"name": "latency", "passed": True},
            {"name": "payment_failures", "passed": True},
        ],
    )


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError)),
    reraise=True,
)
async def _request_decision_http(payload: AIDecisionRequest) -> AIDecisionResponse:
    async with httpx.AsyncClient(timeout=settings.AI_HTTP_TIMEOUT_SECONDS) as client:
        response = await client.post(
            f"{settings.AI_LAYER_2_URL.rstrip('/')}/decide",
            json=payload.model_dump(mode="json"),
        )
        response.raise_for_status()
        return AIDecisionResponse(**response.json())


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError)),
    reraise=True,
)
async def _request_verification_http(payload: AIVerificationRequest) -> AIVerificationResponse:
    async with httpx.AsyncClient(timeout=settings.AI_HTTP_TIMEOUT_SECONDS) as client:
        response = await client.post(
            f"{settings.AI_LAYER_2_URL.rstrip('/')}/verify",
            json=payload.model_dump(mode="json"),
        )
        response.raise_for_status()
        return AIVerificationResponse(**response.json())


async def request_decision(payload: AIDecisionRequest) -> AIDecisionResponse:
    logger.info("Sending incident %s to AI Layer 2", payload.incident_id)
    if _should_mock():
        logger.info("Using simulated AI Layer 2 response")
        return _mock_decision(payload)

    try:
        return await _request_decision_http(payload)
    except Exception as exc:
        logger.error("AI Layer 2 decision failed after retries: %s", exc)
        raise


async def request_verification(payload: AIVerificationRequest) -> AIVerificationResponse:
    logger.info("Sending verification request for incident %s to AI Layer 2", payload.incident_id)
    if _should_mock():
        return _mock_verification(payload)

    try:
        return await _request_verification_http(payload)
    except Exception as exc:
        logger.error("AI Layer 2 verification failed after retries: %s", exc)
        raise
