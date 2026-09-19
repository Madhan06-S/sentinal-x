# Report 1: System Architecture & Folder Structure Report

**Project**: Autonomous Enterprise Incident Resolution Engine (SentinelX)  
**Primary Application**: `backend/`  
**Database Owner**: `backend/sentinelx.db`  

---

## 1. Executive Summary

This report presents the unified single-backend system architecture for the **Autonomous Enterprise Incident Resolution Engine**. The architecture consolidates all API orchestration, database persistence, event processing, RAG knowledge retrieval, Groq AI investigation, risk policy enforcement, safe remediation, threshold verification, and web user interface into a single primary application directory (`backend/`).

---

## 2. Unified System Architecture Diagram

```text
External Telemetry Systems (GitHub Webhooks / Alertmanager / Simulator)
                           │
                           ▼
             Primary FastAPI Backend Server (`backend`)
                           │
                           ▼
          Canonical Event Processing (`event_service.py`)
                           │
   ┌───────────────────────┼───────────────────────┐
   ▼                       ▼                       ▼
Normalization     Noise Filtering          Fingerprint Dedup
(Unified Schema)  (KEEP/DEPRIORITIZE/      (SHA256 300s Window)
                   IGNORE)
                           │
                           ▼
          Multi-Signal Correlation & Incident Formation
                           │
                           ▼
      Layer 1 AI Investigation (`ai_service.py` + `groq_service.py`)
         ├──────────────────────────┐
         ▼                          ▼
   RAG Knowledge Store        Groq / Llama Reasoning
   (Exact Code + TF-IDF)     (H1/H2/H3 + Evidence)
         │                          │
         └─────────────┬────────────┘
                       ▼
      Deterministic Confidence & Business Impact
                       │
                       ▼
      Layer 2 Decision Engine (`action_registry.py`)
         ├──────────────────────────┐
         ▼                          ▼
   HIGH Risk Actions         LOW/MEDIUM Risk Actions
   (Human Approval Req.)     (Auto/Permitted Execution)
         │                          │
         └─────────────┬────────────┘
                       ▼
     Safe Remediation Simulation & Metric Threshold Verifier
                       │
                       ▼
   Incident Resolution / Escalation & RAG Knowledge Auto-Capture
                       │
                       ▼
      Interactive Web Dashboard (`http://127.0.0.1:8000/`)
```

---

## 3. Directory Tree Breakdown

### `backend/` Directory Tree

```text
backend/
├── alembic/                                    # Database Migration Control
│   ├── env.py
│   ├── script.py.mako
│   └── versions/                               # Schema Version Chain
│       ├── ef9fce3b4be5_initial_tables.py
│       ├── b7c2d91e4a10_expand_domain_tables.py
│       ├── a9b24fb1bb0a_add_normalizedevent_fields_to_alerts.py
│       ├── 4863023ee605_add_error_code_and_update_incidentstatus.py
│       ├── ce207ff6205d_add_knowledge_document.py
│       └── c1f930e18a99_add_remediation_suggestion_to_knowledge_documents.py
├── app/                                        # Core Application Package
│   ├── __init__.py
│   ├── main.py                                 # FastAPI Server Entry Point & Web UI Mount
│   ├── api/                                    # REST API Versioning Layer
│   │   └── v1/
│   │       ├── alerts.py                       # Alert querying endpoints
│   │       ├── approvals.py                    # Action approval aliases
│   │       ├── audit.py                        # Incident audit timeline endpoints
│   │       ├── deployments.py                  # Service deployment telemetry
│   │       ├── events.py                       # Canonical event ingestion endpoint
│   │       ├── incidents.py                    # Incident lifecycle, /analyze, /approve, /remediate
│   │       ├── remediation.py                  # Remediation execution aliases
│   │       ├── services.py                     # Service catalog endpoints
│   │       ├── simulation.py                   # Simulator scenario triggers
│   │       ├── webhooks.py                     # Alertmanager & K8s webhook entry points
│   │       ├── websockets.py                   # Real-time WebSocket streaming
│   │       └── integrations/
│   │           └── github.py                   # GitHub Webhook signature validation
│   ├── core/                                   # Application Core & Configuration
│   │   ├── action_registry.py                  # Allowed Actions & Risk Policy Rules
│   │   ├── config.py                           # Pydantic BaseSettings Environment Config
│   │   ├── database.py                         # Async SQLAlchemy Engine & SessionLocal
│   │   ├── logging.py                          # Structured Logging Setup
│   │   ├── realtime.py                         # WebSocket Event Publisher
│   │   └── seed.py                             # Catalog Initializer
│   ├── models/                                 # Domain Persistence Layer
│   │   └── models.py                           # Alert, Incident, AuditLog, KnowledgeDocument, etc.
│   ├── schemas/                                # Validation Schemas
│   │   └── schemas.py                          # NormalizedEvent, AIInvestigationResult, etc.
│   ├── services/                               # Integrated Business Logic Services
│   │   ├── ai_service.py                       # Groq Prompting, H1/H2/H3, UNKNOWN Fallback
│   │   ├── alert_service.py                    # Alert Query Logic
│   │   ├── audit_service.py                    # Audit Log Creation
│   │   ├── catalog_service.py                  # Service Graph & Telemetry
│   │   ├── event_service.py                    # Normalization, Noise Filter, Fingerprinting, Correlation
│   │   ├── groq_service.py                     # Groq LLM API Client with JSON Schema Validation
│   │   ├── incident_service.py                 # Incident Queries & Graph Serialization
│   │   ├── jobs.py                             # Asynchronous Background Processing
│   │   ├── rag_service.py                      # TF-IDF Cosine Similarity, Exact Match & KB Storage
│   │   ├── remediation_service.py              # Simulated Metrics & Threshold Verification
│   │   ├── seed_data.py                        # Troubleshooting & Error Code Knowledge Seeds
│   │   └── simulator_service.py                # Scenario 1 (Cascade) & Scenario 2 (Unknown)
│   └── static/                                 # Web Dashboard Static Assets
│       └── index.html                          # Single-Page Interactive React Dashboard
├── tests/                                      # Automated Test Suite
│   ├── e2e_verification.py                     # Multi-Scenario E2E Verification Script
│   ├── test_ai_agent_integration.py           # AI Agent, RAG, Policy & Remediation Tests
│   ├── test_ai_flow.py                        # Async AI Pipeline Tests
│   ├── test_api.py                             # REST Route & Webhook Tests
│   ├── test_events.py                          # Event Ingestion, Filter & Dedup Tests
│   └── test_integrations.py                    # Webhook Signature & Serialization Tests
├── DEMO_GUIDE.md                               # Complete Demonstration Manual
├── README.md
├── alembic.ini                                 # Alembic Configuration
├── pytest.ini                                  # Pytest Configuration (pythonpath = .)
├── requirements.txt                            # Unified Dependencies
└── sentinelx.db                                # Primary SQLite Database File
```

---

## 4. Component Responsibility Summary

| Component | Responsible Modules | Key Functionality |
| :--- | :--- | :--- |
| **API Layer** | `app/api/v1/` | REST routes, webhooks, WebSockets, static dashboard mount (`GET /`). |
| **Ingestion Engine** | `app/services/event_service.py` | Canonical normalization, noise filtering, fingerprint deduplication, correlation. |
| **RAG Knowledge Base** | `app/services/rag_service.py`, `seed_data.py` | TF-IDF similarity vector ranking, exact error matching, auto-saving resolved incidents. |
| **AI Investigation** | `app/services/ai_service.py`, `groq_service.py` | Groq Llama JSON prompting, hypotheses formulation (H1, H2, H3), `UNKNOWN` fallback. |
| **Decision Policy** | `app/core/action_registry.py` | Risk classification (`LOW`, `MEDIUM`, `HIGH`), human approval enforcement. |
| **Remediation & Verifier**| `app/services/remediation_service.py` | Safe state-transition simulation, independent metric threshold checks. |
| **Data Persistence** | `app/models/models.py`, `sentinelx.db` | Async SQLAlchemy models, single database ownership model. |
