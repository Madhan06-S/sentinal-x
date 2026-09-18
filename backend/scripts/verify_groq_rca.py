import sys
import asyncio
import json
from datetime import datetime, timezone
import httpx

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BACKEND_URL = "http://127.0.0.1:8000"

async def test_real_incident():
    print("\n=========================================")
    print("1. RUNNING REAL INCIDENT TEST (GROQ RCA)")
    print("=========================================")

    deploy_event = {
        "event_id": f"evt-deploy-{int(datetime.now().timestamp())}",
        "source": "github",
        "app": "NexaCart",
        "event_type": "deployment",
        "service": "checkout-api-v2",
        "environment": "production",
        "severity": "LOW",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "message": "Deployment v2.5.0 released for checkout-api-v2",
        "metadata": {
            "version": "v2.5.0",
            "commit": "a1b2c3d"
        }
    }

    failure_event = {
        "event_id": f"evt-fail-{int(datetime.now().timestamp())}",
        "source": "application",
        "app": "NexaCart",
        "event_type": "PaymentGatewayError",
        "service": "checkout-api-v2",
        "environment": "production",
        "severity": "CRITICAL",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "error_code": "PAY-301",
        "message": "Stripe API Connection Timeout after 30000ms - Memory spike 92%",
        "metadata": {
            "gateway": "Stripe",
            "retry_count": 3,
            "latency_ms": 30005,
            "transaction_id": "tx_req_groq_test_1001"
        }
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        await client.post(f"{BACKEND_URL}/api/v1/events", json=deploy_event)
        await asyncio.sleep(0.5)

        res = await client.post(f"{BACKEND_URL}/api/v1/events", json=failure_event)
        print(f"Ingest Event HTTP Status: {res.status_code}")
        event_resp = res.json()
        incident_id = event_resp.get("incident_id")
        print(f"Captured Incident ID: {incident_id}")

        if not incident_id:
            inc_list_res = await client.get(f"{BACKEND_URL}/api/v1/incidents")
            incidents = inc_list_res.json()
            incident_id = incidents[0]["id"]
            print(f"Using Latest Incident ID: {incident_id}")

        inv_res = await client.post(f"{BACKEND_URL}/api/v1/incidents/{incident_id}/investigate")
        print(f"Trigger Investigation HTTP Status: {inv_res.status_code}")

        print("Waiting 8 seconds for Groq LLM analysis completion...")
        await asyncio.sleep(8.0)

        inc_res = await client.get(f"{BACKEND_URL}/api/v1/incidents/{incident_id}")
        inc = inc_res.json()
        print(f"Fetch Incident Details HTTP Status: {inc_res.status_code}")

        ana_res = await client.get(f"{BACKEND_URL}/api/v1/incidents/{incident_id}/analysis")
        analysis_records = ana_res.json()
        print(f"Fetch Analysis Records HTTP Status: {ana_res.status_code}")

        root_cause = inc.get("root_cause")
        confidence = inc.get("confidence")
        business_impact = inc.get("business_impact")
        recommended_action = inc.get("recommended_action")
        rc_evidence = inc.get("root_cause_evidence", {}) or {}

        supporting = rc_evidence.get("supporting_evidence", [])
        contradicting = rc_evidence.get("contradicting_evidence", [])
        reasoning = rc_evidence.get("reasoning", "")

        print("\n--- ACTUAL INVESTIGATION OUTPUT ---")
        print(f"ROOT CAUSE: {root_cause}")
        print(f"REASON: {reasoning}")
        print(f"CONFIDENCE: {confidence}")
        print(f"SUPPORTING EVIDENCE: {json.dumps(supporting, indent=2)}")
        print(f"CONTRADICTING EVIDENCE: {json.dumps(contradicting, indent=2)}")
        print(f"BUSINESS IMPACT: {business_impact}")
        print(f"RECOMMENDED ACTION: {recommended_action}")
        print(f"ANALYSIS RECORDS IN DB: {len(analysis_records)}")

        assert inc_res.status_code == 200
        assert root_cause is not None and root_cause != "" and root_cause != "UNKNOWN"
        assert confidence is not None
        assert len(analysis_records) > 0, "No AIAnalysis record saved in SQLite"
        print("\n--> REAL INCIDENT TEST PASSED SUCCESSFULLY!")
        return inc

async def test_insufficient_evidence():
    print("\n=========================================")
    print("2. RUNNING INSUFFICIENT EVIDENCE SCENARIO TEST")
    print("=========================================")

    event_payload = {
        "event_id": f"evt-insufficient-{int(datetime.now().timestamp())}",
        "source": "application",
        "app": "NexaCart",
        "event_type": "PaymentGatewayError",
        "service": "isolated-test-service",
        "environment": "staging",
        "severity": "HIGH",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "error_code": "UNKNOWN-999",
        "message": "Uncorrelated transient ping failure",
        "metadata": {
            "scenario": "insufficient_evidence"
        }
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(f"{BACKEND_URL}/api/v1/events", json=event_payload)
        event_resp = res.json()
        incident_id = event_resp.get("incident_id")

        if not incident_id:
            inc_list_res = await client.get(f"{BACKEND_URL}/api/v1/incidents")
            incidents = inc_list_res.json()
            incident_id = incidents[0]["id"]

        print(f"Triggering investigation for Insufficient Evidence Incident: {incident_id}")
        await client.post(f"{BACKEND_URL}/api/v1/incidents/{incident_id}/investigate")

        await asyncio.sleep(5.0)

        inc_res = await client.get(f"{BACKEND_URL}/api/v1/incidents/{incident_id}")
        inc = inc_res.json()

        root_cause = inc.get("root_cause")
        rc_evidence = inc.get("root_cause_evidence", {}) or {}
        reasoning = rc_evidence.get("reasoning", "")

        print("\n--- INSUFFICIENT EVIDENCE OUTPUT ---")
        print(f"ROOT CAUSE: {root_cause}")
        print(f"REASON: {reasoning}")
        print(f"CONFIDENCE: {inc.get('confidence')}")

        assert root_cause == "UNKNOWN", f"Expected ROOT_CAUSE UNKNOWN but got {root_cause}"
        assert "INSUFFICIENT_EVIDENCE" in reasoning, f"Expected INSUFFICIENT_EVIDENCE in reasoning but got {reasoning}"
        print("\n--> INSUFFICIENT EVIDENCE SCENARIO TEST PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(test_real_incident())
    asyncio.run(test_insufficient_evidence())
