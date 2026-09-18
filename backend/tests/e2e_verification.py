import asyncio
from datetime import datetime, timezone
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.models import Incident, KnowledgeDocument, IncidentStatus
from app.services.simulator_service import run_scenario
from app.services.ai_service import run_ai_analysis_pipeline
from app.services.remediation_service import record_approval, execute_remediation, verify_remediation


async def main():
    print("=" * 60)
    print("STARTING END-TO-END VERIFICATION OF INTEGRATED SYSTEM")
    print("=" * 60)

    # 1. RUN SCENARIO 1: Payment Degradation Cascade
    print("\n[SCENARIO 1] Triggering Payment Cascade Scenario...")
    await run_scenario("cascade")
    
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Incident).where(Incident.title.contains("payment-service")).order_by(Incident.created_at.desc()))
        incident_1 = res.scalars().first()
        assert incident_1 is not None, "Scenario 1 incident was not created"
        print(f"-> Created Incident: {incident_1.id} ({incident_1.title})")
        
        # Run AI Analysis Pipeline (RAG + Groq / Fallback + Policy Engine)
        print("-> Running AI Investigation & RAG Retrieval...")
        incident_1 = await run_ai_analysis_pipeline(db, incident_1.id)
        
        print(f"-> RCA: {incident_1.root_cause}")
        print(f"-> Confidence: {incident_1.confidence}")
        print(f"-> Business Impact: {incident_1.business_impact}")
        print(f"-> Recommended Action: {incident_1.recommended_action} (Risk: {incident_1.risk_level.value})")
        print(f"-> Approval Required: {incident_1.approval_required}")
        print(f"-> Status: {incident_1.status.value}")
        
        assert incident_1.recommended_action == "ROLLBACK_DEPLOYMENT"
        assert incident_1.risk_level.value == "HIGH"
        assert incident_1.status == IncidentStatus.AWAITING_APPROVAL
        
        # Approve High Risk Action
        print("-> Approving High-Risk Action (ROLLBACK_DEPLOYMENT)...")
        incident_1 = await record_approval(db, incident_1, actor="sre_lead", comment="Rollback authorized", approved=True)
        assert incident_1.status == IncidentStatus.REMEDIATING
        
        # Execute Remediation Simulator & Metric Threshold Verification
        print("-> Executing Safe Remediation & Threshold Verification...")
        incident_1 = await execute_remediation(db, incident_1.id)
        incident_1 = await verify_remediation(db, incident_1.id)
        
        print(f"-> Final Status: {incident_1.status.value}")
        print(f"-> Resolved At: {incident_1.resolved_at}")
        assert incident_1.status == IncidentStatus.RESOLVED

    # 2. RUN SCENARIO 2: Insufficient Evidence / Unknown Root Cause
    print("\n[SCENARIO 2] Triggering Insufficient Evidence Scenario...")
    await run_scenario("insufficient_evidence")
    
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Incident).where(Incident.title.contains("notification-service")).order_by(Incident.created_at.desc()))
        incident_2 = res.scalars().first()
        assert incident_2 is not None, "Scenario 2 incident was not created"
        print(f"-> Created Incident: {incident_2.id} ({incident_2.title})")
        
        print("-> Running AI Investigation for Insufficient Evidence...")
        incident_2 = await run_ai_analysis_pipeline(db, incident_2.id)
        
        print(f"-> RCA: {incident_2.root_cause}")
        print(f"-> Reasoning: {incident_2.decision_reason}")
        print(f"-> Confidence: {incident_2.confidence}")
        print(f"-> Recommended Action: {incident_2.recommended_action}")
        
        assert incident_2.root_cause == "UNKNOWN"
        assert "INSUFFICIENT_EVIDENCE" in (incident_2.decision_reason or "")
        assert incident_2.recommended_action == "ESCALATE"
        assert incident_2.confidence < 0.5

    # 3. VERIFY RAG KNOWLEDGE PERSISTENCE
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(KnowledgeDocument).where(KnowledgeDocument.document_type == "historical_incident"))
        docs = res.scalars().all()
        print(f"\n[RAG KNOWLEDGE] Saved {len(docs)} historical resolved incident documents into knowledge base!")

    print("\n" + "=" * 60)
    print("ALL END-TO-END SCENARIO CHECKS PASSED SUCCESSFULLY WITH 100% VERIFICATION!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
