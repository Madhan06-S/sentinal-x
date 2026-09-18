# SentinelX Autonomous Incident Resolution Engine — Demonstration Guide

This guide outlines step-by-step instructions to run and demonstrate the unified **Autonomous Enterprise Incident Resolution Engine**.

---

## 1. Quick Start Instructions

### Environment Setup & Requirements
- **Python**: Version 3.11+
- **Environment File**: Ensure `.env` is created in `backend/`:
  ```env
  ENVIRONMENT=development
  PROJECT_NAME="SentinelX Incident Engine"
  DATABASE_URL=sqlite+aiosqlite:///sentinelx.db
  GROQ_API_KEY=your_groq_api_key_here
  GROQ_MODEL=openai/gpt-oss-120b
  GITHUB_WEBHOOK_SECRET=demo_webhook_secret
  AUTO_REMEDIATE_LOW_RISK=false
  ```
  *(Note: If `GROQ_API_KEY` is not provided, the engine automatically falls back to deterministic RCA reasoning.)*

### Start the Unified Backend Server
```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Access Applications
- **Interactive UI Dashboard**: `http://127.0.0.1:8000/`
- **FastAPI OpenAPI Docs**: `http://127.0.0.1:8000/docs`

---

## 2. Demonstrating Scenario 1: Payment Service Degradation Cascade

### Steps:
1. Open the UI dashboard at `http://127.0.0.1:8000/`.
2. Click **🚀 Scenario 1: Payment Cascade** in the top header.
3. **Event Stream & Correlation**:
   - Telemetry signals (`deployment`, `memory_alert`, `database_alert DB-104`, `api_alert LAT-504`, `business_alert`) are ingested, noise-filtered, deduplicated, and correlated into incident `INC-XXXX`.
4. **AI Investigation & RAG Retrieval**:
   - Click **Run AI Investigation** (or call `POST /api/v1/incidents/{id}/analyze`).
   - RAG Knowledge Base retrieves exact error doc `DB-104` and payment troubleshooting guide using TF-IDF cosine similarity.
   - Groq AI (or deterministic fallback) evaluates hypotheses H1, H2, H3 and determines root cause:
     > *"Recent deployment on payment-service introduced database connection pool leak"*
   - Confidence score (`90%`) and business impact mapping (`Payment Processing`) are displayed.
5. **Layer 2 Policy Engine & Human Approval**:
   - Policy Engine classifies `ROLLBACK_DEPLOYMENT` as `HIGH` risk.
   - Incident status transitions to `AWAITING_APPROVAL` with `approval_required: true`.
   - The UI displays a prominent green **✓ Approve High-Risk Action** button.
6. **Execution & Independent Metric Verification**:
   - Click **✓ Approve High-Risk Action**.
   - Remediation simulator executes rollback (BEFORE metrics: Memory 94%, DB Pool 100/100 -> AFTER metrics: Memory 45%, DB Pool 42/100, Latency 180ms).
   - Metric threshold verifier evaluates checks (`memory < 70%`, `db_connections < 80`, `latency < 500ms`, `error_rate < 5%`).
   - Incident status transitions to `RESOLVED`.
   - Resolved incident is automatically converted into a historical knowledge document for future RAG context.

---

## 3. Demonstrating Scenario 2: Insufficient Evidence / Unknown Root Cause

### Steps:
1. Click **❓ Scenario 2: Unknown Cause** in the top header.
2. An isolated transient error event without preceding deployment or correlated signals is ingested.
3. Click **Run AI Investigation**.
4. **Expected Result**:
   - `probable_root_cause`: `UNKNOWN`
   - `reasoning`: `INSUFFICIENT_EVIDENCE: Isolated signal without supporting operational evidence.`
   - `confidence`: `15%` (Low confidence)
   - `recommended_action`: `ESCALATE`
   - `risk_level`: `LOW`
   - **Safety Guarantee**: Unsafe high-risk remediation is blocked.

---

## 4. Key API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/simulation/start?scenario=cascade` | Triggers Scenario 1 or Scenario 2 demo cascade |
| `POST` | `/api/v1/events` | Ingests canonical heterogeneous events |
| `GET` | `/api/v1/incidents` | Lists active incidents |
| `GET` | `/api/v1/incidents/{id}` | Gets incident details with alerts and AI analyses |
| `POST` | `/api/v1/incidents/{id}/analyze` | Runs RAG retrieval + Groq LLM RCA pipeline |
| `POST` | `/api/v1/incidents/{id}/approve` | Records human approval for high-risk actions |
| `POST` | `/api/v1/incidents/{id}/remediate` | Executes remediation simulation & metric verification |
| `GET` | `/api/v1/incidents/{id}/timeline` | Returns chronological lifecycle audit trail |
| `GET` | `/api/v1/ws/{client_id}` | WebSocket real-time incident event stream |

---

## 5. Troubleshooting & Fallbacks

- **Groq API Key Missing / Rate Limited**: If `GROQ_API_KEY` is not set or API request times out, the backend logs a warning and seamlessly uses deterministic fallback reasoning without breaking the demonstration flow.
- **Database Reset**: To reset to clean initial state, delete `sentinelx.db` and restart `uvicorn app.main:app`. Database tables and initial seed data will automatically be recreated.
