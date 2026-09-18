import pytest
from datetime import datetime, timezone
import uuid
from httpx import AsyncClient, ASGITransport

import app.services.groq_service as groq_service
import app.services.ai_service as ai_service

async def mock_analyze_with_groq(prompt: str, schema_class):
    if schema_class.__name__ == "AIInvestigationResult":
        return schema_class(
            probable_root_cause="Mock root cause: Recent deployment caused memory spike.",
            confidence=0.9,
            hypotheses=["Deployment v1.1 broke DB pooling"],
            evidence=["Memory spiked to 94%"],
            contradicting_evidence=[],
            business_impact="Users cannot pay.",
            recommended_action="ROLLBACK_DEPLOYMENT"
        )
    return schema_class()

groq_service.analyze_with_groq = mock_analyze_with_groq
ai_service.analyze_with_groq = mock_analyze_with_groq

from app.main import app
from app.models.models import Severity

@pytest.mark.asyncio
async def test_full_ai_remediation_flow():
    # Ensure monkey-patch is active on ai_service
    ai_service.analyze_with_groq = mock_analyze_with_groq
    groq_service.analyze_with_groq = mock_analyze_with_groq

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test", follow_redirects=True) as client:
        # 1. Ingest an alert that creates an incident
        payload = {
            "event_id": f"evt_{uuid.uuid4().hex[:8]}",
            "source": "prometheus",
            "service": f"payment-service-{uuid.uuid4().hex[:6]}",
            "event_type": "deployment",
            "error_code": "DB-104",
            "severity": Severity.CRITICAL,
            "message": "Memory spiked to 94% following deployment v2.4.1",
            "environment": "production",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        resp = await client.post("/api/v1/events", json=payload)
        assert resp.status_code == 201
        
        # 2. Extract the incident ID
        incident_id = resp.json().get("incident_id")
        assert incident_id is not None
        
        # 3. Trigger Investigation (Replaces mock layers)
        inv_resp = await client.post(f"/api/v1/incidents/{incident_id}/investigate")
        assert inv_resp.status_code == 200
        # For testing, we run the pipeline synchronously
        from app.core.database import AsyncSessionLocal
        from app.services.ai_service import run_ai_analysis_pipeline
        from app.services.remediation_service import execute_remediation, verify_remediation, record_approval
        
        async with AsyncSessionLocal() as db:
            incident = await run_ai_analysis_pipeline(db, incident_id)
            assert incident.recommended_action == "ROLLBACK_DEPLOYMENT"
            assert incident.status == "AWAITING_APPROVAL" # Because ROLLBACK is HIGH risk
            
            # Approve it
            incident = await record_approval(db, incident, "test_user", "LGTM", approved=True)
            assert incident.status == "REMEDIATING"
            
            # Remediate
            incident = await execute_remediation(db, incident.id)
            assert incident.status == "VERIFYING"
            
            # Verify
            incident = await verify_remediation(db, incident.id)
            assert incident.status == "RESOLVED"
            
            # Check if saved to RAG
            from app.models.models import KnowledgeDocument
            from sqlalchemy import select
            result = await db.execute(select(KnowledgeDocument).where(KnowledgeDocument.tags.op('->>')('incident_id') == incident_id))
            doc = result.scalars().first()
            assert doc is not None
            assert "Root Cause:" in doc.content or "Mock root cause" in doc.content
