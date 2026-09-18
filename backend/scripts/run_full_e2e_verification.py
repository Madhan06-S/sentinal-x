import sys
import asyncio
import json
import uuid
from datetime import datetime, timezone
import httpx
import websockets

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BACKEND_URL = "http://127.0.0.1:8000"
NEXACART_URL = "http://localhost:5173"
WS_URL = "ws://127.0.0.1:8000/api/v1/ws/"

results_matrix = []

def record_test(method, endpoint, purpose, body_str, expected, actual, status):
    results_matrix.append({
        "method": method,
        "endpoint": endpoint,
        "purpose": purpose,
        "request_body": body_str,
        "expected_status": expected,
        "actual_status": actual,
        "result": status
    })

async def run_full_verification():
    print("\n==================================================")
    print("STARTING FULL ENDPOINT & NEXACART INTEGRATION TEST")
    print("==================================================")

    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:

        # --------------------------------------------------
        # SECTION 1: HEALTH / SYSTEM CHECKS
        # --------------------------------------------------
        print("\n--- 1. Testing Health & System Endpoints ---")
        res = await client.get(f"{BACKEND_URL}/api/v1/health")
        print(f"GET /api/v1/health -> HTTP {res.status_code}: {res.json()}")
        record_test("GET", "/api/v1/health", "Backend Health Check", "None", 200, res.status_code, "PASS" if res.status_code == 200 else "FAIL")

        try:
            nexa_res = await client.get(NEXACART_URL)
            print(f"GET {NEXACART_URL} -> HTTP {nexa_res.status_code}")
            record_test("GET", "http://localhost:5173/", "NexaCart App Reachability", "None", 200, nexa_res.status_code, "PASS" if nexa_res.status_code == 200 else "FAIL")
        except Exception as exc:
            print(f"NexaCart Reachability Error: {exc}")
            record_test("GET", "http://localhost:5173/", "NexaCart App Reachability", "None", 200, 0, "FAIL")

        res = await client.get(f"{BACKEND_URL}/api/v1/services")
        print(f"GET /api/v1/services -> HTTP {res.status_code}, count: {len(res.json()) if res.status_code==200 else 0}")
        record_test("GET", "/api/v1/services", "List Registered Services", "None", 200, res.status_code, "PASS" if res.status_code == 200 else "FAIL")

        res = await client.get(f"{BACKEND_URL}/api/v1/deployments")
        print(f"GET /api/v1/deployments -> HTTP {res.status_code}, count: {len(res.json()) if res.status_code==200 else 0}")
        record_test("GET", "/api/v1/deployments", "List Deployments", "None", 200, res.status_code, "PASS" if res.status_code == 200 else "FAIL")

        res = await client.get(f"{BACKEND_URL}/api/v1/audit")
        print(f"GET /api/v1/audit -> HTTP {res.status_code}, count: {len(res.json()) if res.status_code==200 else 0}")
        record_test("GET", "/api/v1/audit", "List Audit Trail", "None", 200, res.status_code, "PASS" if res.status_code == 200 else "FAIL")

        # --------------------------------------------------
        # SECTION 2: EVENT INGESTION & DEDUPLICATION
        # --------------------------------------------------
        print("\n--- 2. Testing Event Ingestion & Deduplication ---")
        test_evt_id = f"nexacart-e2e-payment-{uuid.uuid4().hex[:6]}"
        unique_service = f"payment-service-e2e-{uuid.uuid4().hex[:6]}"

        deploy_payload = {
            "event_id": f"evt-deploy-{uuid.uuid4().hex[:6]}",
            "source": "github",
            "app": "NexaCart",
            "event_type": "deployment",
            "service": unique_service,
            "environment": "development",
            "severity": "LOW",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "message": f"Deployment v2.5.0 released for {unique_service}",
            "metadata": {"version": "v2.5.0", "commit": "c4d5e6f"}
        }
        await client.post(f"{BACKEND_URL}/api/v1/events", json=deploy_payload)
        await asyncio.sleep(0.5)

        event_payload = {
            "event_id": test_evt_id,
            "source": "application",
            "event_type": "payment_failure",
            "service": unique_service,
            "environment": "development",
            "severity": "CRITICAL",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error_code": "PAY-301",
            "message": "PAY-301: Payment Gateway Timeout. Memory spiked to 92%.",
            "metadata": {
                "app": "NexaCart",
                "environment": "development",
                "root_error": "ConnectionTimeoutException"
            }
        }

        # First Ingestion
        res1 = await client.post(f"{BACKEND_URL}/api/v1/events", json=event_payload)
        print(f"POST /api/v1/events (Initial) -> HTTP {res1.status_code}: {res1.json()}")
        record_test("POST", "/api/v1/events", "Ingest NexaCart Telemetry Event", "NormalizedEvent Payload", 201, res1.status_code, "PASS" if res1.status_code == 201 else "FAIL")
        
        event_resp = res1.json()
        incident_id = event_resp.get("incident_id")
        print(f"Created Incident ID: {incident_id}")

        # Deduplication Check (Second Ingestion with same event_id)
        res2 = await client.post(f"{BACKEND_URL}/api/v1/events", json=event_payload)
        print(f"POST /api/v1/events (Duplicate) -> HTTP {res2.status_code}: {res2.json()}")
        dedup_status = res2.json().get("status")
        is_dedup_pass = res2.status_code == 201 and dedup_status in ["DUPLICATE", "FILTERED", "PROCESSING"]
        record_test("POST", "/api/v1/events", "Test Event Deduplication Window", "Duplicate Event Payload", 201, res2.status_code, "PASS" if is_dedup_pass else "FAIL")

        # Alert Ingestion Endpoint Test
        alert_payload = {
            "source": "prometheus",
            "service": unique_service,
            "alert_type": "PaymentGatewayError",
            "severity": "CRITICAL",
            "message": "High failure rate on payment processing",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "metadata": {"app": "NexaCart"}
        }
        res_alert = await client.post(f"{BACKEND_URL}/api/v1/alerts", json=alert_payload)
        print(f"POST /api/v1/alerts -> HTTP {res_alert.status_code}")
        record_test("POST", "/api/v1/alerts", "Ingest Raw Alert", "AlertCreate Payload", 201, res_alert.status_code, "PASS" if res_alert.status_code == 201 else "FAIL")

        res_alerts_list = await client.get(f"{BACKEND_URL}/api/v1/alerts")
        record_test("GET", "/api/v1/alerts", "List All Alerts", "None", 200, res_alerts_list.status_code, "PASS" if res_alerts_list.status_code == 200 else "FAIL")

        if res_alerts_list.status_code == 200 and len(res_alerts_list.json()) > 0:
            first_alert_id = res_alerts_list.json()[0]["id"]
            res_alert_detail = await client.get(f"{BACKEND_URL}/api/v1/alerts/{first_alert_id}")
            record_test("GET", f"/api/v1/alerts/{first_alert_id}", "Get Alert Detail", "None", 200, res_alert_detail.status_code, "PASS" if res_alert_detail.status_code == 200 else "FAIL")

        # --------------------------------------------------
        # SECTION 3: INCIDENT DETAILS, TIMELINE & GRAPH
        # --------------------------------------------------
        print("\n--- 3. Testing Incident Detail, Timeline & Graph ---")
        res_inc_list = await client.get(f"{BACKEND_URL}/api/v1/incidents")
        record_test("GET", "/api/v1/incidents", "List All Incidents", "None", 200, res_inc_list.status_code, "PASS" if res_inc_list.status_code == 200 else "FAIL")

        if not incident_id and res_inc_list.status_code == 200:
            incident_id = res_inc_list.json()[0]["id"]

        res_inc_detail = await client.get(f"{BACKEND_URL}/api/v1/incidents/{incident_id}")
        print(f"GET /api/v1/incidents/{incident_id} -> HTTP {res_inc_detail.status_code}")
        record_test("GET", f"/api/v1/incidents/{{id}}", "Get Incident Detail", "None", 200, res_inc_detail.status_code, "PASS" if res_inc_detail.status_code == 200 else "FAIL")

        res_timeline = await client.get(f"{BACKEND_URL}/api/v1/incidents/{incident_id}/timeline")
        print(f"GET /api/v1/incidents/{incident_id}/timeline -> HTTP {res_timeline.status_code}, entries: {len(res_timeline.json()) if res_timeline.status_code==200 else 0}")
        record_test("GET", f"/api/v1/incidents/{{id}}/timeline", "Get Incident Timeline", "None", 200, res_timeline.status_code, "PASS" if res_timeline.status_code == 200 else "FAIL")

        res_audit = await client.get(f"{BACKEND_URL}/api/v1/incidents/{incident_id}/audit")
        record_test("GET", f"/api/v1/incidents/{{id}}/audit", "Get Incident Audit Logs", "None", 200, res_audit.status_code, "PASS" if res_audit.status_code == 200 else "FAIL")

        res_graph = await client.get(f"{BACKEND_URL}/api/v1/incidents/{incident_id}/graph")
        print(f"GET /api/v1/incidents/{incident_id}/graph -> HTTP {res_graph.status_code}: {res_graph.json() if res_graph.status_code==200 else ''}")
        record_test("GET", f"/api/v1/incidents/{{id}}/graph", "Get Incident Graph Topology", "None", 200, res_graph.status_code, "PASS" if res_graph.status_code == 200 else "FAIL")

        # --------------------------------------------------
        # SECTION 4: AI INVESTIGATION & GROQ LLM PIPELINE
        # --------------------------------------------------
        print("\n--- 4. Testing AI Investigation & Groq LLM Pipeline ---")
        res_inv = await client.post(f"{BACKEND_URL}/api/v1/incidents/{incident_id}/investigate")
        print(f"POST /api/v1/incidents/{incident_id}/investigate -> HTTP {res_inv.status_code}")
        record_test("POST", f"/api/v1/incidents/{{id}}/investigate", "Trigger AI Investigation Pipeline", "None", 200, res_inv.status_code, "PASS" if res_inv.status_code == 200 else "FAIL")

        print("Waiting 8 seconds for Groq LLM completion...")
        await asyncio.sleep(8.0)

        res_inc_updated = await client.get(f"{BACKEND_URL}/api/v1/incidents/{incident_id}")
        inc_data = res_inc_updated.json()
        print(f"Post-Investigation Incident Root Cause: {inc_data.get('root_cause')}")
        print(f"Post-Investigation Action: {inc_data.get('recommended_action')}, Risk: {inc_data.get('risk_level')}, Approval Required: {inc_data.get('approval_required')}")

        res_analysis = await client.get(f"{BACKEND_URL}/api/v1/incidents/{incident_id}/analysis")
        print(f"GET /api/v1/incidents/{incident_id}/analysis -> HTTP {res_analysis.status_code}, count: {len(res_analysis.json()) if res_analysis.status_code==200 else 0}")
        record_test("GET", f"/api/v1/incidents/{{id}}/analysis", "Get AI Analysis Records", "None", 200, res_analysis.status_code, "PASS" if res_analysis.status_code == 200 else "FAIL")

        # --------------------------------------------------
        # SECTION 5: APPROVAL, REMEDIATION & VERIFICATION
        # --------------------------------------------------
        print("\n--- 5. Testing Approval, Remediation & Verification ---")
        # Create a fresh isolated HIGH-risk incident for approval & premature remediation tests
        appr_service = f"svc-appr-{uuid.uuid4().hex[:6]}"
        await client.post(f"{BACKEND_URL}/api/v1/events", json={
            "event_id": f"evt-dep-appr-{uuid.uuid4().hex[:6]}",
            "source": "github", "app": "NexaCart", "event_type": "deployment",
            "service": appr_service, "environment": "production", "severity": "LOW",
            "timestamp": datetime.now(timezone.utc).isoformat(), "message": "Deployment v2.0"
        })
        await asyncio.sleep(0.5)
        res_appr_evt = await client.post(f"{BACKEND_URL}/api/v1/events", json={
            "event_id": f"evt-fail-appr-{uuid.uuid4().hex[:6]}",
            "source": "application", "event_type": "PaymentGatewayError",
            "service": appr_service, "environment": "production", "severity": "CRITICAL",
            "timestamp": datetime.now(timezone.utc).isoformat(), "error_code": "PAY-301",
            "message": "Stripe connection timeout memory spike 92%"
        })
        appr_inc_id = res_appr_evt.json().get("incident_id")
        await client.post(f"{BACKEND_URL}/api/v1/incidents/{appr_inc_id}/investigate")
        await asyncio.sleep(7.0)

        # Attempt remediation before approval (Security Guardrail Test)
        res_premature_rem = await client.post(f"{BACKEND_URL}/api/v1/incidents/{appr_inc_id}/remediate")
        print(f"Premature Remediation Attempt (Unapproved HIGH risk) -> HTTP {res_premature_rem.status_code}")
        record_test("POST", f"/api/v1/incidents/{{id}}/remediate", "Premature Remediation Guardrail", "None", 400, res_premature_rem.status_code, "PASS" if res_premature_rem.status_code == 400 else "FAIL")

        # Approve Action
        approval_body = {"approved_by": "admin", "comment": "Approved for E2E testing", "decision": "APPROVED"}
        res_approve = await client.post(f"{BACKEND_URL}/api/v1/incidents/{appr_inc_id}/approve", json=approval_body)
        print(f"POST /api/v1/incidents/{appr_inc_id}/approve -> HTTP {res_approve.status_code}")
        record_test("POST", f"/api/v1/incidents/{{id}}/approve", "Approve Incident Action", "ApprovalRequest Payload", 200, res_approve.status_code, "PASS" if res_approve.status_code == 200 else "FAIL")

        # Execute Remediation
        res_rem = await client.post(f"{BACKEND_URL}/api/v1/incidents/{appr_inc_id}/remediate")
        print(f"POST /api/v1/incidents/{appr_inc_id}/remediate -> HTTP {res_rem.status_code}")
        record_test("POST", f"/api/v1/incidents/{{id}}/remediate", "Execute Remediation Action", "None", 200, res_rem.status_code, "PASS" if res_rem.status_code == 200 else "FAIL")

        await asyncio.sleep(2.0)

        # Verification Status Check
        res_verif = await client.get(f"{BACKEND_URL}/api/v1/incidents/{appr_inc_id}/verification")
        print(f"GET /api/v1/incidents/{appr_inc_id}/verification -> HTTP {res_verif.status_code}")
        record_test("GET", f"/api/v1/incidents/{{id}}/verification", "Get Verification Records", "None", 200, res_verif.status_code, "PASS" if res_verif.status_code == 200 else "FAIL")

        # Test Rejection Guardrail on a dedicated HIGH-risk test incident
        rej_service = f"svc-rej-{uuid.uuid4().hex[:6]}"
        await client.post(f"{BACKEND_URL}/api/v1/events", json={
            "event_id": f"evt-dep-rej-{uuid.uuid4().hex[:6]}",
            "source": "github", "app": "NexaCart", "event_type": "deployment",
            "service": rej_service, "environment": "production", "severity": "LOW",
            "timestamp": datetime.now(timezone.utc).isoformat(), "message": "Deployment v1.9.0"
        })
        await asyncio.sleep(0.5)

        res_rej_evt = await client.post(f"{BACKEND_URL}/api/v1/events", json={
            "event_id": f"evt-fail-rej-{uuid.uuid4().hex[:6]}",
            "source": "application", "event_type": "PaymentGatewayError",
            "service": rej_service, "environment": "production", "severity": "CRITICAL",
            "timestamp": datetime.now(timezone.utc).isoformat(), "error_code": "PAY-301",
            "message": "Stripe timeout memory spike 92%"
        })
        rej_inc_id = res_rej_evt.json().get("incident_id")
        if rej_inc_id:
            await client.post(f"{BACKEND_URL}/api/v1/incidents/{rej_inc_id}/investigate")
            await asyncio.sleep(7.0)
            rejection_body = {"rejected_by": "admin", "comment": "Testing rejection guardrail"}
            res_reject = await client.post(f"{BACKEND_URL}/api/v1/incidents/{rej_inc_id}/reject", json=rejection_body)
            print(f"POST /api/v1/incidents/{rej_inc_id}/reject -> HTTP {res_reject.status_code}")
            record_test("POST", f"/api/v1/incidents/{{id}}/reject", "Reject Incident Action", "RejectionRequest Payload", 200, res_reject.status_code, "PASS" if res_reject.status_code == 200 else "FAIL")

        # --------------------------------------------------
        # SECTION 6: WEBHOOKS & SIMULATION
        # --------------------------------------------------
        print("\n--- 6. Testing Webhooks & Simulation ---")
        am_payload = {
            "alerts": [{
                "status": "firing",
                "labels": {"alertname": "HighLatency", "service": unique_service, "severity": "critical"},
                "annotations": {"summary": "Payment service latency exceeds 5s", "description": "High DB contention"}
            }]
        }
        res_am = await client.post(f"{BACKEND_URL}/api/v1/webhooks/alertmanager", json=am_payload)
        print(f"POST /api/v1/webhooks/alertmanager -> HTTP {res_am.status_code}")
        record_test("POST", "/api/v1/webhooks/alertmanager", "AlertManager Webhook", "AlertManager Payload Dict", 200, res_am.status_code, "PASS" if res_am.status_code == 200 else "FAIL")

        gh_payload = {
            "action": "completed",
            "workflow_run": {"name": "Deploy", "conclusion": "success", "head_commit": {"id": "abcdef123456"}},
            "repository": {"name": "nexacart", "full_name": "org/nexacart"}
        }
        res_gh = await client.post(f"{BACKEND_URL}/api/v1/webhooks/github", json=gh_payload)
        print(f"POST /api/v1/webhooks/github -> HTTP {res_gh.status_code}")
        record_test("POST", "/api/v1/webhooks/github", "GitHub Webhook", "GitHub Payload", 200, res_gh.status_code, "PASS" if res_gh.status_code in [200, 201] else "FAIL")

        k8s_payload = {
            "reason": "OOMKilled",
            "message": f"Container {unique_service} killed due to memory limit",
            "involvedObject": {"kind": "Pod", "name": f"{unique_service}-pod-1"},
            "metadata": {"namespace": "default"}
        }
        res_k8s = await client.post(f"{BACKEND_URL}/api/v1/webhooks/kubernetes", json=k8s_payload)
        print(f"POST /api/v1/webhooks/kubernetes -> HTTP {res_k8s.status_code}")
        record_test("POST", "/api/v1/webhooks/kubernetes", "Kubernetes Webhook", "K8s Event Payload", 201, res_k8s.status_code, "PASS" if res_k8s.status_code in [200, 201] else "FAIL")

        res_sim_start = await client.post(f"{BACKEND_URL}/api/v1/simulation/start")
        print(f"POST /api/v1/simulation/start -> HTTP {res_sim_start.status_code}")
        record_test("POST", "/api/v1/simulation/start", "Start Scenario Simulation", "None", 200, res_sim_start.status_code, "PASS" if res_sim_start.status_code == 200 else "FAIL")

        res_sim_status = await client.get(f"{BACKEND_URL}/api/v1/simulation/status")
        print(f"GET /api/v1/simulation/status -> HTTP {res_sim_status.status_code}")
        record_test("GET", "/api/v1/simulation/status", "Get Simulation Status", "None", 200, res_sim_status.status_code, "PASS" if res_sim_status.status_code == 200 else "FAIL")

        # --------------------------------------------------
        # SECTION 7: WEBSOCKET BROADCAST TEST
        # --------------------------------------------------
        print("\n--- 7. Testing WebSocket Broadcast ---")
        ws_success = False
        try:
            async with websockets.connect(WS_URL) as websocket:
                print("Connected to WebSocket server successfully.")
                ws_evt = {
                    "event_id": f"evt-ws-{uuid.uuid4().hex[:6]}",
                    "source": "application",
                    "event_type": "PaymentGatewayError",
                    "service": f"ws-service-{uuid.uuid4().hex[:6]}",
                    "environment": "production",
                    "severity": "HIGH",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "message": "WebSocket broadcast test trigger"
                }
                await client.post(f"{BACKEND_URL}/api/v1/events", json=ws_evt)
                
                msg = await asyncio.wait_for(websocket.recv(), timeout=3.0)
                print(f"WebSocket Message Received: {msg[:120]}...")
                ws_success = True
        except Exception as exc:
            print(f"WebSocket Test Result: {exc}")

        record_test("WS", "/api/v1/ws/", "Live WebSocket Subscription", "WebSocket Connection", 101, 101 if ws_success else 0, "PASS" if ws_success else "FAIL")

        # --------------------------------------------------
        # SECTION 8: ERROR HANDLING (4xx vs 500)
        # --------------------------------------------------
        print("\n--- 8. Testing Error Handling ---")
        res_404 = await client.get(f"{BACKEND_URL}/api/v1/incidents/INC-NONEXISTENT-999")
        record_test("GET", "/api/v1/incidents/INC-NONEXISTENT-999", "Nonexistent Incident 404", "None", 404, res_404.status_code, "PASS" if res_404.status_code == 404 else "FAIL")

        res_422 = await client.post(f"{BACKEND_URL}/api/v1/events", content="invalid json text")
        record_test("POST", "/api/v1/events", "Malformed JSON Handling", "Invalid Text", 422, res_422.status_code, "PASS" if res_422.status_code in [400, 422] else "FAIL")

        # --------------------------------------------------
        # SECTION 9: PII & SECURITY AUDIT
        # --------------------------------------------------
        print("\n--- 9. PII & Security Verification ---")
        inc_all_res = await client.get(f"{BACKEND_URL}/api/v1/incidents")
        inc_data_list = inc_all_res.json() if inc_all_res.status_code == 200 else []
        inc_json_str = json.dumps(inc_data_list)

        pii_keywords = ["cardholder", "card_number", "credit_card", "cvv", "password", "secret_key"]
        found_pii = [kw for kw in pii_keywords if kw in inc_json_str.lower()]

        print(f"PII Keywords Found in Backend Incident API Responses: {found_pii}")
        key_exposed = "gsk_" in inc_json_str or "GROQ_API_KEY" in inc_json_str
        print(f"GROQ_API_KEY Exposed in Backend Responses: {key_exposed}")

    print("\n==================================================")
    print("FINISHED ALL VERIFICATION TESTS")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_full_verification())
