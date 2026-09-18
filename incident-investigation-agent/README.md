# Autonomous Incident Resolution Engine

An open-source, lightweight incident investigation and safe remediation platform for student developers, indie developers, and hackathon projects.

The system helps developers answer:
1. **What happened to my application?**
2. **What is probably causing it?**
3. **What evidence supports that conclusion?**
4. **What should I do?**
5. **Did the fix actually work?**

---

## Autonomous Incident Lifecycle

```text
  DETECT (Log Ingestion API / GitHub Webhooks / Alert Simulator)
    │
    ▼
  FILTER (Deterministic Noise Filter: KEEP / DEPRIORITIZE / IGNORE)
    │
    ▼
  DEDUPLICATE (Fingerprinting & Time-Window Aggregation)
    │
    ▼
  CORRELATE (Multi-Signal Proximity -> Logical Incident INC-xxx)
    │
    ▼
  PRIORITIZE (Dynamic Severity & Priority Calculation)
    │
    ▼
  INVESTIGATE (RAG Hybrid Retrieval + Groq AI Structured Hypotheses)
    │
    ▼
  EXPLAIN (Evidence Comparison, Deterministic Confidence, Business Impact)
    │
    ▼
  DECIDE (Predefined Action Registry + Deterministic Risk Policy)
    │
    ├─────────────────────────────┐
    ▼ (High Risk: ROLLBACK)       ▼ (Low Risk)
  APPROVE (Human Approval UI)   Auto / Permitted Execution
    │                             │
    └──────────────┬──────────────┘
                   ▼
  REMEDIATE (Safe State Simulation: BEFORE vs AFTER Metrics)
                   │
                   ▼
  VERIFY (Independent Operational Threshold Recovery Check)
                   │
                   ├─────────────────────────────┐
                   ▼ (Passed)                    ▼ (Failed)
                RESOLVED                     ESCALATED
                   │
                   ▼
  AUDIT TRAIL & HISTORICAL KNOWLEDGE RETRIEVAL
```

---

## Technology Stack

- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy, SQLite3, Groq API, `httpx`
- **Frontend**: React, Vite, Vanilla CSS (Glassmorphism Dark Theme, Cyberpunk Aesthetics)
- **RAG & Knowledge**: Hybrid Retriever (Exact Error Match + Metadata Filtering + TF-IDF Keyword Ranking)
- **Database**: SQLite3 (`data/incident_engine.db`)
- **Testing**: `pytest`, `httpx` TestClient

---

## Setup & Installation

### 1. Backend Setup

```bash
cd incident-investigation-agent
python -m venv .venv

# Windows PowerShell:
.venv\Scripts\Activate.ps1

# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. `.env` Configuration

Copy `.env.example` to `.env` and configure optional keys:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

DATABASE_URL=sqlite:///./data/incident_engine.db

GITHUB_TOKEN=
GITHUB_REPOSITORY=
GITHUB_WEBHOOK_SECRET=

APP_HOST=0.0.0.0
APP_PORT=8000
LOG_LEVEL=INFO
```

### 3. Run Backend Server

```bash
uvicorn app.main:app --reload --port 8000
```

Swagger UI documentation is accessible at: `http://127.0.0.1:8000/docs`

---

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The React dashboard runs at `http://localhost:5173`.

---

## Running Automated Tests

Run backend unit and integration tests:

```bash
.venv\Scripts\python.exe -m pytest
```

---

## Hackathon Demo Steps

1. Open Frontend Dashboard at `http://localhost:5173`.
2. **Scenario 1 — Payment Service Failure**:
   - Click **"Trigger Scenario 1: Payment Service Failure"**.
   - Observe incoming events normalized, filtered, deduplicated, and correlated into `INC-001`.
   - Click **"Start Groq & RAG Investigation"**: Observe Groq evaluating hypotheses (H1, H2, H3), evidence scoring, business impact (`Payment Processing - HIGH`), and recommending `ROLLBACK_DEPLOYMENT`.
   - Observe Risk Engine flagging `ROLLBACK_DEPLOYMENT` as `HIGH` risk, requiring human approval.
   - Click **"Approve (ROLLBACK_DEPLOYMENT)"**.
   - Click **"Execute Simulated Remediation"**: Observe BEFORE (High Memory, Max DB Pool, Latency 4.8s) vs AFTER metrics (Healthy).
   - Observe Verification Engine checking metrics -> Status updated to **RESOLVED**.
   - View complete step-by-step Audit Trail.

3. **Scenario 2 — Insufficient Evidence**:
   - Click **"Trigger Scenario 2: Insufficient Evidence Error"**.
   - Click **"Start Groq & RAG Investigation"**.
   - Observe system returning `ROOT_CAUSE = UNKNOWN` with reasoning `INSUFFICIENT_EVIDENCE` without fabricating conclusions.
