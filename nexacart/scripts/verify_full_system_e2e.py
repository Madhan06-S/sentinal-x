import json
import time
import urllib.request
import urllib.parse

BASE_URL = "http://127.0.0.1:8000"

def http_post(endpoint, payload=None):
    url = f"{BASE_URL}{endpoint}"
    data = json.dumps(payload or {}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        return e.code, json.loads(body) if body else {}

def http_get(endpoint):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode('utf-8'))

def run_full_e2e():
    print("======================================================================")
    print("RUNNING COMPLETE LIVE END-TO-END INTEGRATION TEST")
    print("======================================================================\n")

    # ------------------------------------------------------------------
    # TEST SCENARIO 1: CASCADE INCIDENT (DEPLOYMENT + DB-104 + PAYMENT FAILURE)
    # ------------------------------------------------------------------
    print("[SCENARIO 1] Triggering payment cascade scenario...")
    status, sim_resp = http_post("/api/v1/simulation/start", {"scenario": "cascade"})
    print(f"-> Simulator Trigger Status: {status}")
    print(f"-> Simulator Response: {sim_resp}")

    time.sleep(1.0)

    print("\n[SCENARIO 1] Fetching incidents list to identify newly created incident...")
    status, incidents = http_get("/api/v1/incidents")
    if not incidents:
        raise RuntimeError("No incidents found in system!")
    
    # Take the latest incident
    incident = incidents[0]
    incident_id = incident["id"]
    print(f"-> Incident ID: {incident_id}")
    print(f"-> Service: {incident.get('service')}")
    print(f"-> Initial Status: {incident.get('status')}")

    print(f"\n[SCENARIO 1] Triggering AI investigation (RAG + Groq) for {incident_id}...")
    status, inv_resp = http_post(f"/api/v1/incidents/{incident_id}/investigate")
    print(f"-> Investigation API Status: {status}")

    # Allow async AI analysis pipeline to execute
    time.sleep(3.0)

    print(f"\n[SCENARIO 1] Fetching investigation result for {incident_id}...")
    status, detailed_inc = http_get(f"/api/v1/incidents/{incident_id}")
    
    rca = detailed_inc.get("root_cause")
    conf = detailed_inc.get("confidence")
    impact = detailed_inc.get("business_impact")
    rec_action = detailed_inc.get("recommended_action")
    risk = detailed_inc.get("risk_level")
    appr_req = detailed_inc.get("approval_required")
    evidence = detailed_inc.get("root_cause_evidence") or {}

    print("\n--------------------------------------------------")
    print("SCENARIO 1 INVESTIGATION RESULT FROM LIVE SYSTEM:")
    print("--------------------------------------------------")
    print(f"ROOT CAUSE:\n{rca}")
    print(f"\nREASON:\n{detailed_inc.get('decision_reason')}")
    print(f"\nCONFIDENCE:\n{conf}")
    print(f"\nSUPPORTING EVIDENCE:\n{json.dumps(evidence.get('supporting_evidence'), indent=2)}")
    print(f"\nCONTRADICTING EVIDENCE:\n{json.dumps(evidence.get('contradicting_evidence'), indent=2)}")
    print(f"\nBUSINESS IMPACT:\n{impact}")
    print(f"\nRECOMMENDED ACTION:\n{rec_action}")
    print(f"\nRISK LEVEL:\n{risk}")
    print(f"\nAPPROVAL REQUIRED:\n{appr_req}")
    print("--------------------------------------------------")

    # If action requires approval, approve it
    if appr_req and detailed_inc.get("status") == "AWAITING_APPROVAL":
        print(f"\n[SCENARIO 1] Action '{rec_action}' requires human approval. Approving...")
        status, app_resp = http_post(f"/api/v1/incidents/{incident_id}/approve", {
            "approved_by": "sre-lead@nexacart.com",
            "comment": "Approved rollback of payment-service deployment v2.4.1"
        })
        print(f"-> Approval Status Code: {status}")
        print(f"-> Incident Status after approval: {app_resp.get('status')}")

        print(f"\n[SCENARIO 1] Executing simulated remediation & verification...")
        status, rem_resp = http_post(f"/api/v1/incidents/{incident_id}/remediate")
        print(f"-> Remediation Trigger Status: {status}")
        
        time.sleep(1.0)
        status, final_inc = http_get(f"/api/v1/incidents/{incident_id}")
        print(f"-> Final Status: {final_inc.get('status')}")
        print(f"-> Resolved At: {final_inc.get('resolved_at')}")

    # Fetch Timeline Audit Trail
    print(f"\n[SCENARIO 1] Fetching audit trail timeline for {incident_id}...")
    status, timeline = http_get(f"/api/v1/incidents/{incident_id}/timeline")
    print(f"-> Audit Log Steps ({len(timeline)} events):")
    for step in timeline:
        print(f"   [{step.get('event_type')}] {step.get('description') or step.get('details')}")

    # ------------------------------------------------------------------
    # TEST SCENARIO 2: INSUFFICIENT EVIDENCE SCENARIO
    # ------------------------------------------------------------------
    print("\n\n======================================================================")
    print("[SCENARIO 2] Triggering insufficient evidence scenario...")
    status, sim2_resp = http_post("/api/v1/simulation/start", {"scenario": "insufficient_evidence"})
    print(f"-> Simulator Trigger Status: {status}")

    time.sleep(1.0)
    status, incidents2 = http_get("/api/v1/incidents")
    
    # Find the isolated notification-service incident
    iso_inc = next((i for i in incidents2 if i.get("service") == "notification-service"), incidents2[0])
    iso_id = iso_inc["id"]
    print(f"-> Insufficient Evidence Incident ID: {iso_id}")

    print(f"\n[SCENARIO 2] Triggering AI investigation for isolated incident {iso_id}...")
    status, _ = http_post(f"/api/v1/incidents/{iso_id}/investigate")
    time.sleep(3.0)

    status, iso_detailed = http_get(f"/api/v1/incidents/{iso_id}")
    print("\n--------------------------------------------------")
    print("SCENARIO 2 INVESTIGATION RESULT FROM LIVE SYSTEM:")
    print("--------------------------------------------------")
    print(f"ROOT CAUSE:\n{iso_detailed.get('root_cause')}")
    print(f"\nREASON:\n{iso_detailed.get('decision_reason')}")
    print(f"\nCONFIDENCE:\n{iso_detailed.get('confidence')}")
    print(f"\nRECOMMENDED ACTION:\n{iso_detailed.get('recommended_action')}")
    print(f"\nRISK LEVEL:\n{iso_detailed.get('risk_level')}")
    print("--------------------------------------------------")

    print("\n======================================================================")
    print("LIVE E2E INTEGRATION TEST COMPLETED SUCCESSFULLY!")
    print("======================================================================")

if __name__ == "__main__":
    run_full_e2e()
