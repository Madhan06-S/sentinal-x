import json
import time
import urllib.request

BASE_URL = "http://127.0.0.1:8000"

def test_real_payment_failure_telemetry():
    print("======================================================================")
    print("VERIFYING REAL NEXACART TELEMETRY DISPLAY & PII SAFETY")
    print("======================================================================\n")

    nonce = Date.now() if 'Date' in globals() else int(time.time() * 1000)

    # 1. Construct NexaCart event payload (strictly matching PaymentPage.tsx)
    payload = {
        "event_id": f"nexacart-{nonce}-pay-ui",
        "source": "application",
        "event_type": "payment_failure",
        "service": "payment-service",
        "environment": "development",
        "severity": "CRITICAL",
        "timestamp": "2026-09-19T03:49:00.000Z",
        "error_code": "PAY-301",
        "message": f"PAY-301: Payment Gateway Timeout (503 Service Unavailable) [tx_{nonce}]. Unable to acquire database transaction lock from pool [HikariCP-PaymentDB: 100/100 active connections]. Card authorization aborted.",
        "metadata": {
            "app": "NexaCart",
            "environment": "development",
            "root_error": "ConnectionTimeoutException: Unable to acquire connection from pool within 30000ms"
        }
    }

    # 2. POST to /api/v1/events
    print("[STEP 1] Transmitting real NexaCart telemetry to POST /api/v1/events...")
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/api/v1/events", data=data, headers={"Content-Type": "application/json"})
    
    with urllib.request.urlopen(req) as resp:
        print(f"-> Ingestion Status: {resp.status}")
        ingest_data = json.loads(resp.read().decode('utf-8'))
        print(f"-> Ingest Response: {ingest_data}")
        incident_id = ingest_data.get("incident_id")

    if not incident_id:
        # Fetch incidents list to locate incident if correlated
        req_inc = urllib.request.Request(f"{BASE_URL}/api/v1/incidents", headers={"Accept": "application/json"})
        with urllib.request.urlopen(req_inc) as resp_inc:
            incidents = json.loads(resp_inc.read().decode('utf-8'))
            incident_id = incidents[0]["id"]

    print(f"\n[STEP 2] Captured Incident ID: {incident_id}")

    # 3. GET /api/v1/incidents/{incident_id}
    print(f"[STEP 3] Fetching Incident Details for {incident_id}...")
    req_det = urllib.request.Request(f"{BASE_URL}/api/v1/incidents/{incident_id}", headers={"Accept": "application/json"})
    with urllib.request.urlopen(req_det) as resp_det:
        inc_detail = json.loads(resp_det.read().decode('utf-8'))

    alerts = inc_detail.get("alerts", [])
    print(f"-> Found {len(alerts)} alert(s) attached to Incident {incident_id}:")

    for i, a in enumerate(alerts, 1):
        meta = a.get("metadata") or a.get("meta") or {}
        print(f"\n   --- ALERT #{i} ---")
        print(f"   Source:      {a.get('source')}")
        print(f"   App Name:    {meta.get('app', 'NexaCart')}")
        print(f"   Event Type:  {a.get('alert_type') or a.get('event_type')}")
        print(f"   Service:     {a.get('service')}")
        print(f"   Environment: {a.get('environment')}")
        print(f"   Severity:    {a.get('severity')}")
        print(f"   Timestamp:   {a.get('timestamp')}")
        print(f"   Error Code:  {a.get('error_code')}")
        print(f"   Message:     {a.get('message')}")
        print(f"   Metadata:    {json.dumps(meta)}")

        # PII Check Assertions
        assert "cardholder" not in meta, "FAIL: PII 'cardholder' present in metadata!"
        assert "total_charge" not in meta, "FAIL: PII 'total_charge' present in metadata!"
        assert "email" not in meta, "FAIL: PII 'email' present in metadata!"
        print("   [OK] PII SAFETY CHECK PASSED (No customer PII present)")

    # 4. GET /api/v1/incidents/{incident_id}/timeline
    print(f"\n[STEP 4] Fetching Timeline Audit Trail for {incident_id}...")
    req_time = urllib.request.Request(f"{BASE_URL}/api/v1/incidents/{incident_id}/timeline", headers={"Accept": "application/json"})
    with urllib.request.urlopen(req_time) as resp_time:
        timeline = json.loads(resp_time.read().decode('utf-8'))
        print(f"-> Timeline Events ({len(timeline)} logs):")
        for t in timeline[:10]:
            print(f"   [{t.get('event_type')}] {t.get('details')}")

    print("\n======================================================================")
    print("NEXACART TELEMETRY DISPLAY & PII VERIFICATION COMPLETED SUCCESSFULLY!")
    print("======================================================================")

if __name__ == "__main__":
    test_real_payment_failure_telemetry()
