import asyncio
import uuid
from datetime import datetime, timezone
import pytest
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.models import IncidentStatus, KnowledgeDocument, Severity
from app.schemas.schemas import NormalizedEvent
from app.services.event_service import process_event
from app.services.rag_service import retrieve_knowledge
from app.services.ai_service import run_ai_analysis_pipeline
from app.services.remediation_service import execute_remediation, record_approval, verify_remediation


@pytest.mark.asyncio
async def test_rag_retrieval_and_tfidf():
    async with AsyncSessionLocal() as db_session:
        docs = await retrieve_knowledge(
            db_session,
            error_code="DB-104",
            service="payment-service",
            query="database connection pool exhaustion leak",
            limit=5,
        )
        assert len(docs) > 0
        assert any("DB-104" in (d.error_code or d.title or "") for d in docs)
        assert any("payment" in (d.service or "").lower() for d in docs)


@pytest.mark.asyncio
async def test_full_incident_pipeline_scenario_1():
    async with AsyncSessionLocal() as db_session:
        # Ingest deployment event
        deploy_event = NormalizedEvent(
            event_id="evt_dep_101",
            source="github",
            event_type="deployment",
            service="payment-service",
            environment="production",
            severity=Severity.INFO,
            timestamp=datetime.now(timezone.utc),
            message="Deployed v2.4.1 commit 4a2b1c",
            metadata={"version": "v2.4.1"},
        )
        await process_event(db_session, deploy_event)

        # Ingest critical error event
        error_event = NormalizedEvent(
            event_id="evt_err_102",
            source="alertmanager",
            event_type="database_alert",
            service="payment-service",
            environment="production",
            severity=Severity.CRITICAL,
            timestamp=datetime.now(timezone.utc),
            error_code="DB-104",
            message="Database connection pool exhausted",
            metadata={"metric": "db_connections", "value": 1500},
        )
        alert = await process_event(db_session, error_event)

        assert alert.incident_id is not None
        incident_id = alert.incident_id

        # Run AI Analysis Pipeline
        incident = await run_ai_analysis_pipeline(db_session, incident_id)

        assert incident.root_cause is not None
        assert incident.confidence is not None
        assert incident.analysis_summary is not None
        assert incident.recommended_action == "ROLLBACK_DEPLOYMENT"
        assert incident.risk_level.value == "HIGH"
        assert incident.approval_required is True
        assert incident.status == IncidentStatus.AWAITING_APPROVAL

        # Record Approval
        incident = await record_approval(db_session, incident, actor="sre_team", comment="Approved rollback", approved=True)
        assert incident.status == IncidentStatus.REMEDIATING

        # Execute Remediation
        incident = await execute_remediation(db_session, incident.id)
        assert incident.status == IncidentStatus.VERIFYING

        # Verify Remediation
        incident = await verify_remediation(db_session, incident.id)
        assert incident.status == IncidentStatus.RESOLVED
        assert incident.resolved_at is not None

        # Verify resolved incident saved to RAG knowledge base
        result = await db_session.execute(select(KnowledgeDocument).where(KnowledgeDocument.document_type == "historical_incident"))
        historical_docs = result.scalars().all()
        assert len(historical_docs) > 0


@pytest.mark.asyncio
async def test_insufficient_evidence_scenario_2():
    async with AsyncSessionLocal() as db_session:
        isolated_event = NormalizedEvent(
            event_id="evt_iso_201",
            source="application",
            event_type="app_error",
            service=f"notification-service-{uuid.uuid4().hex[:6]}",
            environment="production",
            severity=Severity.HIGH,
            timestamp=datetime.now(timezone.utc),
            message="Isolated transient socket reset",
            metadata={"scenario": "insufficient_evidence"},
        )
        alert = await process_event(db_session, isolated_event)
        assert alert.incident_id is not None
        incident_id = alert.incident_id

        # Run AI Analysis Pipeline
        incident = await run_ai_analysis_pipeline(db_session, incident_id)

        assert incident.root_cause == "UNKNOWN"
        assert "INSUFFICIENT_EVIDENCE" in (incident.decision_reason or "")
        assert incident.recommended_action == "ESCALATE"
        assert incident.confidence < 0.5
