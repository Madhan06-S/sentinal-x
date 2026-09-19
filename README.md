# Aegis AI Command Center — Autonomous Enterprise Incident Resolution Engine

[![CI Quality & Test Pipeline](https://github.com/Madhan06-S/sentinal-x/actions/workflows/ci.yml/badge.svg)](https://github.com/Madhan06-S/sentinal-x/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-green.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Groq API](https://img.shields.io/badge/AI-Groq%20LLM-purple.svg)](https://groq.com/)

Aegis AI Command Center is an autonomous, evidence-driven incident resolution engine designed for SREs, indie developers, student teams, and self-hosted open-source operations. It automates the operational triage lifecycle from raw telemetry ingestion to verified system recovery.

---

## 1. Problem Statement

Modern microservice applications generate overwhelming alert noise during production outages. On-call engineers spend critical time manually piecing together logs, deployment histories, and database metrics to find root causes and execute remediation scripts. 

Existing AIOps tools are either expensive enterprise black boxes or unconstrained LLM agents that attempt unsafe arbitrary shell execution without safety policies or human approval bounds.

---

## 2. Target Users

- **Site Reliability Engineers (SREs)** seeking automated triage and root-cause evidence scoring.
- **Indie Developers & Small Teams** running self-hosted applications on modest infrastructure.
- **Student & Hackathon Developers** building production-grade incident management pipelines.
- **Open-Source Maintainers** requiring lightweight, predictable incident self-healing without heavy cloud vendor lock-in.

---

## 3. Solution & Product Vision

Aegis provides a lightweight, deterministic AIOps architecture that balances AI reasoning with strict safety policies:
> **Ingest → Filter Noise → Deduplicate → Correlate → RAG Context Retrieval → Evidence-Based Root Cause Investigation → Risk-Evaluated Policy Engine → Human Approval → Safe Remediation → Metric Verification → Audit Log**

---

## 4. System & AI Architecture

```
[ Ingested Signals ] (Alertmanager / GitHub Webhooks / App Logs / Simulator)
         │
         ▼
[ Event Pipeline ] (Deduplication & Correlation Engine)
         │
         ▼
[ Incident Formation ]
         │
         ▼
[ TF-IDF RAG Retrieval ] (Error Codes + Troubleshooting Knowledge + Resolved Incidents)
         │
         ▼
[ Groq LLM Agent ] (openai/gpt-oss-120b Evidence Scoring & Hypothesis Ranking)
         │
         ▼
[ Layer 2 Policy Engine ] ──► [ Risk Classification ]
         │                            │
         │ (High Risk)                │ (Low / Medium Risk)
         ▼                            ▼
[ Human SRE Approval ]      [ Predefined Remediation ]
         │                            │
         └─────────────┬──────────────┘
                       ▼
            [ Action Controller ]
                       │
                       ▼
           [ Telemetry Verification ] ──► Pass: [ RESOLVED ]
                       │
                       └──────────────► Fail: [ INVESTIGATING ]
```

---

## 5. RAG Architecture

Aegis utilizes a 4-tier lightweight retrieval strategy without external vector database dependencies:
1. **Exact Error-Code Matching** (`DB-104`, `MEM-901`): Highest priority (+3.0 score).
2. **Metadata Service Filtering**: Filters docs by target microservice (+1.5 score).
3. **TF-IDF Cosine Similarity**: Ranks unstructured troubleshooting guides (+0.0 to +2.0 score).
4. **Historical Resolved Incident Knowledge**: Automatically converts resolved incidents into new knowledge base entries for future incident lookup.

---

## 6. Predefined Remediation Safety & AI Constraints

To prevent unsafe LLM behavior, **the AI engine is strictly forbidden from executing arbitrary shell scripts, modifying database schemas directly, or generating unvalidated commands.**

Only predefined, sandboxed actions are executable by the remediation controller:

| Action Name | Description | Default Risk Level | Approval Policy |
| :--- | :--- | :--- | :--- |
| `CLEAR_CACHE` | Flushes stale cache tier keys | **LOW** | Auto-execute eligible |
| `RESTART_SERVICE` | Restarts container / pod replicas | **MEDIUM** | Auto-execute eligible |
| `SCALE_SERVICE` | Increases instance replica count | **MEDIUM** | Auto-execute eligible |
| `ROLLBACK_DEPLOYMENT` | Restores previous stable Git version | **HIGH** | **Mandatory Human Approval** |
| `NO_ACTION` | Evaluates no active remediation needed | **LOW** | No execution |
| `ESCALATE` | Escalates to human on-call engineer | **LOW** | No execution |

---

## 7. Tech Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy (Async), SQLite3 (WAL Mode), Pydantic v2.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS (Premium Light Palette), TanStack Query v5, `@xyflow/react` (React Flow v12), Recharts, Lucide Icons.
- **AI & Reasoning**: Groq API (`openai/gpt-oss-120b` or `llama-3.3-70b-versatile`), Pydantic Schema Validation, Tenacity Retries.
- **Testing & CI**: Pytest, Pytest-Asyncio, TypeScript Compiler (`tsc`), GitHub Actions.

---

## 8. Setup & Installation Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run FastAPI backend server (Port 8000)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Configure environment
cp .env.example .env

# Start React dev server (Port 3000)
npm run dev
```

---

## 9. Environment Variables Reference

### Backend `.env` (`backend/.env`)
```env
PROJECT_NAME="Autonomous Enterprise Incident Resolution Engine"
ENVIRONMENT="development"

# SQLite Database Connection
DATABASE_URL="sqlite+aiosqlite:///./sentinelx.db"

# Groq LLM API Settings
GROQ_API_KEY="your-groq-api-key"
GROQ_MODEL="openai/gpt-oss-120b"
AI_HTTP_TIMEOUT_SECONDS=30

# GitHub Webhook Security
GITHUB_WEBHOOK_SECRET="your-github-webhook-secret"

# Autonomy Control
AUTO_REMEDIATE_LOW_RISK=true
```

### Frontend `.env` (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
VITE_USE_MOCK_API=false
```

---

## 10. Running Test Suite

### Backend Pytest Suite
```bash
cd backend
venv/bin/pytest -v
```

### Frontend Typecheck & Production Build
```bash
cd frontend
npx tsc --noEmit
npm run build
```

---

## 11. GitHub Webhook Setup

Aegis includes built-in HMAC SHA-256 signature verification and delivery deduplication for GitHub Webhooks.

1. In your GitHub Repository, go to **Settings → Webhooks → Add Webhook**.
2. **Payload URL**: `http://your-domain-or-ngrok/api/v1/integrations/github/webhook`
3. **Content type**: `application/json`
4. **Secret**: Enter the exact secret matching `GITHUB_WEBHOOK_SECRET` in `backend/.env`.
5. **Events**: Select **Push**, **Deployments**, and **Deployment statuses**.
6. Aegis verifies `X-Hub-Signature-256` headers using constant-time comparison and ignores duplicate `X-GitHub-Delivery` payloads.

---

## 12. Interactive Demo Simulation

Click **"Chaos Console"** in the top bar or send a request to `POST /api/v1/simulation/start`.

The simulation engine executes a realistic production outage:
1. **Deployment Trigger**: Pushes faulty release `v2.4.1` for `orders-service`.
2. **Alert Telemetry Spike**: Ingests DB connection pool exhaustion (`DB-104`).
3. **Aegis AI Reasoning**: Correlates alerts, queries RAG knowledge, ranks root-cause hypotheses (94% confidence).
4. **Policy Enforcement**: Classifies `ROLLBACK_DEPLOYMENT` as **HIGH** risk and triggers human approval modal.
5. **Human Approval**: Operator approves rollback with single click.
6. **Remediation & Metric Verification**: Executes rollback, verifies latency < 500ms and memory < 70%, marks incident `RESOLVED`, and logs to immutable audit trail.

---

## 13. Security & Open-Source Readiness

- **No Hardcoded Secrets**: Secrets are loaded strictly via environment variables.
- **Log Sanitization**: Passwords, API tokens, and webhook signatures are masked in logs.
- **Fail-Safe Fallbacks**: If Groq API experiences rate limits or timeouts, Aegis transitions gracefully to deterministic fallback reasoning without crashing.
- **Open-Source License**: MIT Licensed.

---

## 14. License

Distributed under the MIT License. See `LICENSE` for details.
