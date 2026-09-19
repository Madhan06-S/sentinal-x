import pytest
import hmac
import hashlib
import json
import uuid
from datetime import datetime, timezone
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.action_registry import validate_action, apply_risk_policy, list_available_actions
from app.models.models import Severity, IncidentStatus, AlertStatus, RemediationStatus
from app.schemas.schemas import NormalizedEvent, AlertCreate
from app.services.ai_service import calculate_backend_confidence, build_ai_prompt, run_ai_analysis_pipeline
from app.services.rag_service import retrieve_knowledge, seed_knowledge_base_if_empty
from app.services.remediation_service import record_approval, execute_remediation, verify_remediation
from app.services import groq_service, ai_service

settings.GITHUB_WEBHOOK_SECRET = "hardening-test-secret"


def generate_sig(body: bytes) -> str:
    h = hmac.new(settings.GITHUB_WEBHOOK_SECRET.encode("utf-8"), msg=body, digestmod=hashlib.sha256)
    return "sha256=" + h.hexdigest()


@pytest.mark.asyncio
async def test_confidence_normalization_bounds():
    # Test confidence bounds: 0.0 <= confidence <= 1.0
    c1 = calculate_backend_confidence(0.94, has_deployments=True, has_rag_match=True, has_error_code=True)
    assert 0.0 <= c1 <= 1.0
    assert c1 >= 0.94

    c2 = calculate_backend_confidence(1.5, has_deployments=True, has_rag_match=True, has_error_code=True)
    assert c2 == 1.0

    c3 = calculate_backend_confidence(-0.5, has_deployments=False, has_rag_match=False, has_error_code=False)
    assert c3 == 0.0


@pytest.mark.asyncio
async def test_action_registry_predefined_actions_only():
    # Verify allowed actions list
    actions = [a["action"] for a in list_available_actions()]
    assert set(actions) == {"RESTART_SERVICE", "SCALE_SERVICE", "CLEAR_CACHE", "ROLLBACK_DEPLOYMENT", "NO_ACTION", "ESCALATE"}

    # ROLLBACK_DEPLOYMENT must be HIGH risk and require approval
    risk, approval_req = apply_risk_policy("ROLLBACK_DEPLOYMENT", False)
    assert risk.value == "HIGH"
    assert approval_req is True

    # Invalid action should raise ValueError
    with pytest.raises(ValueError):
        validate_action("EXECUTE_ARBITRARY_SHELL_COMMAND")


@pytest.mark.asyncio
async def test_rag_retrieval_strategy():
    async with AsyncSessionLocal() as db:
        await seed_knowledge_base_if_empty(db)
        docs = await retrieve_knowledge(db, error_code="DB-104", service="payment-service", limit=3)
        assert len(docs) > 0
        assert any("DB" in (d.error_code or "") or "payment" in (d.service or "") for d in docs)


@pytest.mark.asyncio
async def test_github_webhook_duplicate_delivery_and_invalid_signature():
    payload = {
        "repository": {"name": "orders-service", "full_name": "acme/orders-service"},
        "deployment": {"id": 1234, "sha": "abc1234", "environment": "production"},
        "deployment_status": {"state": "failure", "environment": "production"}
    }
    body = json.dumps(payload).encode("utf-8")
    sig = generate_sig(body)
    delivery_id = f"delivery-{uuid.uuid4().hex[:8]}"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test", follow_redirects=True) as ac:
        # 1. Invalid signature request -> 401
        resp_bad_sig = await ac.post(
            "/api/v1/integrations/github/webhook",
            content=body,
            headers={"X-GitHub-Event": "deployment_status", "X-GitHub-Delivery": delivery_id, "X-Hub-Signature-256": "sha256=invalid"}
        )
        assert resp_bad_sig.status_code == 401

        # 2. Valid signature request -> 200 processed
        resp_valid = await ac.post(
            "/api/v1/integrations/github/webhook",
            content=body,
            headers={"X-GitHub-Event": "deployment_status", "X-GitHub-Delivery": delivery_id, "X-Hub-Signature-256": sig}
        )
        assert resp_valid.status_code == 200
        assert resp_valid.json()["status"] in ["processed", "ignored"]

        # 3. Duplicate delivery request -> 200 duplicate ignored
        resp_dup = await ac.post(
            "/api/v1/integrations/github/webhook",
            content=body,
            headers={"X-GitHub-Event": "deployment_status", "X-GitHub-Delivery": delivery_id, "X-Hub-Signature-256": sig}
        )
        assert resp_dup.status_code == 200
        assert resp_dup.json()["status"] in ["duplicate", "ignored"]


@pytest.mark.asyncio
async def test_groq_failure_fallback():
    # Test that when Groq is unavailable, system falls back gracefully to deterministic reasoning without crashing
    async def mock_failing_groq(*args, **kwargs):
        raise groq_service.GroqServiceError("Groq service connection timeout")

    orig_groq = groq_service.analyze_with_groq
    groq_service.analyze_with_groq = mock_failing_groq
    ai_service.analyze_with_groq = mock_failing_groq

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test", follow_redirects=True) as client:
            event_id = f"evt_fallback_{uuid.uuid4().hex[:8]}"
            payload = {
                "event_id": event_id,
                "source": "datadog",
                "service": "auth-service",
                "event_type": "high_error_rate",
                "severity": Severity.HIGH,
                "message": "High HTTP 500 error rate on auth endpoint",
                "environment": "production",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            resp = await client.post("/api/v1/events", json=payload)
            assert resp.status_code == 201
            incident_id = resp.json().get("incident_id")
            assert incident_id is not None

            # Pipeline run should handle Groq error and produce structured fallback
            async with AsyncSessionLocal() as db:
                inc = await run_ai_analysis_pipeline(db, incident_id)
                assert inc.root_cause is not None
                assert inc.recommended_action in ["ESCALATE", "ROLLBACK_DEPLOYMENT", "RESTART_SERVICE", "NO_ACTION"]
    finally:
        groq_service.analyze_with_groq = orig_groq
        ai_service.analyze_with_groq = orig_groq


@pytest.mark.asyncio
async def test_e2e_complete_incident_lifecycle():
    """
    End-to-End Test:
    Deployment -> Error Event -> Incident Creation -> RAG Knowledge Retrieval ->
    RCA Investigation -> Risk Policy -> Human Approval -> Remediation -> Verification -> RESOLVED
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test", follow_redirects=True) as client:
        # 1. Deployment
        dep_id = f"dep_e2e_{uuid.uuid4().hex[:8]}"
        await client.post("/api/v1/events", json={
            "event_id": dep_id,
            "source": "github",
            "service": "payment-gateway",
            "event_type": "deployment",
            "severity": Severity.INFO,
            "message": "Deployed v3.0.0 to production",
            "environment": "production",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

        # 2. Critical Alert creating Incident
        err_id = f"err_e2e_{uuid.uuid4().hex[:8]}"
        err_resp = await client.post("/api/v1/events", json={
            "event_id": err_id,
            "source": "prometheus",
            "service": "payment-gateway",
            "event_type": "database_pool_exhausted",
            "error_code": "DB-104",
            "severity": Severity.CRITICAL,
            "message": "PostgreSQL connection pool exhausted after deployment v3.0.0",
            "environment": "production",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        assert err_resp.status_code == 201
        incident_id = err_resp.json()["incident_id"]
        assert incident_id is not None

        # 3. Investigation
        inv_resp = await client.post(f"/api/v1/incidents/{incident_id}/investigate")
        assert inv_resp.status_code == 200

        async with AsyncSessionLocal() as db:
            # 4. Run AI pipeline
            incident = await run_ai_analysis_pipeline(db, incident_id)
            assert incident.status in [IncidentStatus.AWAITING_APPROVAL, IncidentStatus.REMEDIATING]

            # 5. Record Approval if required
            if incident.approval_required:
                incident = await record_approval(db, incident, actor="sre-lead", comment="Approved for immediate rollback", approved=True)
                assert incident.status == IncidentStatus.REMEDIATING

            # 6. Execute Remediation
            incident = await execute_remediation(db, incident.id)
            assert incident.status == IncidentStatus.VERIFYING

            # 7. Verification
            incident = await verify_remediation(db, incident.id)
            assert incident.status == IncidentStatus.RESOLVED
            assert incident.resolved_at is not None
