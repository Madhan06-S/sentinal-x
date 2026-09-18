# NexaCart ↔ SentinelX Autonomous Incident Resolution Engine Integration Guide

## 1. Overview & Architecture

This guide details the integration of the **NexaCart** e-commerce application with the **SentinelX Autonomous Enterprise Incident Resolution Engine** backend.

```
NexaCart Application (React/TS + Vite)
   │ (Detects operational error / payment failure PAY-301)
   ▼
NexaCart Telemetry Adapter (`nexacart/src/api/events.ts`)
   │ (Normalizes event to SentinelX NormalizedEvent Pydantic schema)
   ▼
POST {VITE_INCIDENT_ENGINE_URL}/api/v1/events
   │ (Graceful 4s timeout, non-blocking fallback if SentinelX offline)
   ▼
SentinelX Primary Backend (`backend`)
   ├─► Normalize → Filter → SHA256 Deduplicate → Correlate (`event_service.py`)
   ├─► Incident Creation (`INC-XXXX`)
   └─► Triggered via POST /api/v1/incidents/{incident_id}/investigate
         ├─► TF-IDF RAG Knowledge Base Retrieval (`rag_service.py`)
         ├─► Groq Llama 3.3 RCA & Hypotheses H1/H2/H3 (`ai_service.py`)
         ├─► Layer 2 Decision & Risk Policy (`action_registry.py`)
         ├─► Human Approval if HIGH Risk (`remediation_service.py`)
         └─► Remediation Execution & Independent Verification
```

---

## 2. Environment Configuration

NexaCart resolves the SentinelX backend URL dynamically using:

- **Environment Variable**: `VITE_INCIDENT_ENGINE_URL`
- **Default Local Value**: `http://localhost:8000` (or `http://127.0.0.1:8000`)

---

## 3. Integration & Alert Detection Points

1. **NexaCart Telemetry Adapter**: [`nexacart/src/api/events.ts`](file:///c:/Users/AJEESH/OneDrive/Desktop/hacx/nexacart/src/api/events.ts)
   - Converts internal telemetry into SentinelX canonical schema.
   - Posts payload to `POST /api/v1/events`.
2. **Payment Failure Handler**: [`nexacart/src/pages/PaymentPage.tsx`](file:///c:/Users/AJEESH/OneDrive/Desktop/hacx/nexacart/src/pages/PaymentPage.tsx)
   - Automatically dispatches `PAY-301` event on gateway timeout or connection pool exhaustion.
3. **Incident Simulator Service**: [`nexacart/src/services/incidentSimulator.ts`](file:///c:/Users/AJEESH/OneDrive/Desktop/hacx/nexacart/src/services/incidentSimulator.ts)
   - Dispatches operational telemetry events during reproducible 5-stage incident scenario.

---

## 4. Exact SentinelX Event Schema (`NormalizedEvent`)

SentinelX accepts JSON payloads at `POST /api/v1/events` matching:

| Field | Type | Required | Description / Value for NexaCart |
| :--- | :--- | :--- | :--- |
| `event_id` | `string` | **Yes** | Unique identifier (e.g. `nexacart-1758253400-abc1234`) |
| `source` | `string` | **Yes** | Must be `"application"` |
| `event_type` | `string` | **Yes** | `"payment_failure"`, `"database_error"`, `"resource_alert"`, `"api_degradation"`, `"deployment"` |
| `service` | `string` | **Yes** | `"payment-service"`, `"checkout-service"`, `"catalog-service"`, `"deployment-service"` |
| `environment` | `string` | No | `"development"` or `"production"` |
| `severity` | `string` | **Yes** | `"CRITICAL"`, `"HIGH"`, `"MEDIUM"`, `"LOW"`, `"INFO"` |
| `timestamp` | `string` | **Yes** | ISO-8601 string (`new Date().toISOString()`) |
| `error_code` | `string` | No | `"PAY-301"`, `"DB-104"`, `"MEM-101"`, `"API-201"`, `"DEP-001"`, or `""` |
| `message` | `string` | **Yes** | Human-readable error description |
| `metadata` | `object` | No | `{ "app": "NexaCart", ... }` |

---

## 5. Failure Mapping Table

| NexaCart Trigger Condition | SentinelX `event_type` | `service` | `severity` | `error_code` |
| :--- | :--- | :--- | :--- | :--- |
| Payment Gateway Timeout / Pool Lock | `payment_failure` | `payment-service` | `CRITICAL` | `PAY-301` |
| HikariCP Connection Pool Exhaustion | `database_error` | `payment-service` | `CRITICAL` | `DB-104` |
| JVM Heap / Process Memory Spike | `resource_alert` | `payment-service` | `HIGH` | `MEM-101` |
| API SLA Latency Surge (> 4.8s) | `api_degradation` | `payment-service` | `CRITICAL` | `API-201` |
| New CI/CD Release Promotion | `deployment` | `deployment-service` | `INFO` | `DEP-001` |

---

## 6. Example Operational Telemetry Event JSON

```json
{
  "event_id": "nexacart-1789788600-k9x2a71",
  "source": "application",
  "event_type": "payment_failure",
  "service": "payment-service",
  "environment": "development",
  "severity": "CRITICAL",
  "timestamp": "2026-09-19T03:30:00.000Z",
  "error_code": "PAY-301",
  "message": "PAY-301: Payment Gateway Timeout (503 Service Unavailable). Unable to acquire database transaction lock from pool [HikariCP-PaymentDB: 100/100 active connections]. Card authorization aborted.",
  "metadata": {
    "app": "NexaCart",
    "environment": "development",
    "root_error": "ConnectionTimeoutException: Unable to acquire connection from pool within 30000ms"
  }
}
```

---

## 7. Example SentinelX Ingestion Response

HTTP Status: **201 Created**
```json
{
  "message": "Event ingested successfully",
  "event_id": "nexacart-1758253400-k9x2a71",
  "id": "evt_98f12a34b",
  "service": "payment-service",
  "severity": "CRITICAL"
}
```

---

## 8. Failure Safety & Offline Resilience

If SentinelX is offline, stopped, returning HTTP 4xx/5xx, or timing out (> 4000ms):
- NexaCart dispatches telemetry asynchronously in non-blocking fashion.
- NexaCart catches network failures gracefully and updates internal connection status to `'OFFLINE'`.
- NexaCart customer payment flow displays clear failure notifications to the user without crashing the web UI.

---

## 9. File Summary

### Files Created
- `nexacart/scripts/test_adapter.js`: 12-test suite for schema validation, offline handling, HTTP status codes, and timeouts.
- `NEXACART_INTEGRATION_GUIDE.md`: Comprehensive integration specification and verification documentation.

### Files Modified
- [`nexacart/src/api/events.ts`](file:///c:/Users/AJEESH/OneDrive/Desktop/hacx/nexacart/src/api/events.ts): SentinelX telemetry adapter formatting for `/api/v1/events`.
- [`nexacart/src/pages/PaymentPage.tsx`](file:///c:/Users/AJEESH/OneDrive/Desktop/hacx/nexacart/src/pages/PaymentPage.tsx): Automatic telemetry dispatch on payment failure.
- [`nexacart/package.json`](file:///c:/Users/AJEESH/OneDrive/Desktop/hacx/nexacart/package.json): Added `npm test` script.
- [`backend/app/services/ai_service.py`](file:///c:/Users/AJEESH/OneDrive/Desktop/hacx/backend/app/services/ai_service.py): Service-scoped deployment matching and metadata scenario handling.

---

## 10. Test & Verification Results

| Component | Command | Result |
| :--- | :--- | :--- |
| NexaCart Adapter Tests | `cd nexacart; npm test` | **12 / 12 Passed** |
| NexaCart TypeScript Build | `cd nexacart; npx tsc --noEmit` | **0 Errors** |
| SentinelX Pytest Suite | `cd backend; python -m pytest` | **16 / 16 Passed** |
| E2E Verification Pipeline | `cd backend; $env:PYTHONPATH="."; python tests/e2e_verification.py` | **100% Passed** |

---

## 11. How to Run Both Applications for Hackathon Demo

### Step 1: Start SentinelX Backend
```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Step 2: Start NexaCart Application
```powershell
cd nexacart
npm run dev
```

### Step 3: Hackathon Demo Steps
1. Open NexaCart in browser (`http://localhost:5173`).
2. Go to `/demo` or click "Simulator Console" to launch the simulated incident scenario, OR attempt checkout in Payment Page.
3. Observe NexaCart automatically dispatching `POST http://127.0.0.1:8000/api/v1/events`.
4. SentinelX ingests events, filters noise, deduplicates, and correlates alerts into `INC-XXXX`.
5. Invoke `POST http://127.0.0.1:8000/api/v1/incidents/{incident_id}/investigate`.
6. SentinelX retrieves RAG knowledge docs, queries Groq Llama 3.3 for RCA and hypotheses (H1, H2), applies Layer 2 risk policy, requests human approval for HIGH risk actions (`ROLLBACK_DEPLOYMENT`), executes remediation, and verifies system recovery.
