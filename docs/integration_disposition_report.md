# Report 2: Integration & Capability Disposition Report

**Project**: Autonomous Enterprise Incident Resolution Engine (SentinelX)  
**Target Codebase**: `backend/`  
**Source Codebase**: `incident-investigation-agent/`  

---

## 1. Executive Summary

This report documents the architectural consolidation of `incident-investigation-agent` into `backend`. All useful capabilities (RAG, Groq AI reasoning, Noise Filtering, Event Fingerprinting, Decision Risk Policy, Remediation Simulation, Metric Threshold Verification) were integrated directly into `backend/app/services/` and `backend/app/core/`. Unnecessary file duplications and deprecated legacy modules were identified and marked for deletion after verifying zero dependency impacts.

---

## 2. File & Module Disposition Matrix

| Original File / Module | Category | Integrated Destination | Technical Explanation |
| :--- | :---: | :--- | :--- |
| `incident-investigation-agent/app/rag/seed_data.py` | **MOVE / MERGE** | `backend/app/services/seed_data.py` | Transferred rich troubleshooting seed documents (`DB-104`, `MEM-503`, `LAT-504`, historical notes) into backend service layer. |
| `incident-investigation-agent/app/rag/retriever.py` | **MERGE** | `backend/app/services/rag_service.py` | Upgraded backend RAG retriever with TF-IDF cosine similarity keyword ranking + exact error-code matching. |
| `incident-investigation-agent/app/ai/investigation_agent.py` | **MERGE** | `backend/app/services/ai_service.py` | Integrated Groq structured JSON system prompt for H1/H2/H3 hypotheses, evidence comparison, and `ROOT_CAUSE=UNKNOWN` fallback. |
| `incident-investigation-agent/app/ai/confidence.py` | **MERGE** | `backend/app/services/ai_service.py` | Integrated deterministic evidence-weighted confidence validation formula into `calculate_backend_confidence`. |
| `incident-investigation-agent/app/ai/business_impact.py` | **MERGE** | `backend/app/services/ai_service.py` | Integrated `map_business_impact` service lookup in backend pipeline. |
| `incident-investigation-agent/app/ingestion/filtering.py` | **MERGE** | `backend/app/services/event_service.py` | Unified noise filter categories (`KEEP`, `DEPRIORITIZE`, `IGNORE`) into backend ingestion orchestrator. |
| `incident-investigation-agent/app/decision/action_registry.py` | **MERGE** | `backend/app/core/action_registry.py` | Unified predefined action list and risk classification rules (`LOW`, `MEDIUM`, `HIGH`, `BLOCKED`). |
| `incident-investigation-agent/app/remediation/verifier.py` | **MERGE** | `backend/app/services/remediation_service.py` | Integrated independent metric threshold verification (`memory < 70%`, `db_connections < 80`, `latency < 500ms`, `error_rate < 5%`). |
| `incident-investigation-agent/app/simulator/scenario_generator.py` | **MERGE** | `backend/app/services/simulator_service.py` | Added Scenario 2 (`INSUFFICIENT_EVIDENCE` isolated signal) into backend simulator. |
| `incident-investigation-agent/tests/test_engine.py` | **ADAPT** | `backend/tests/test_ai_agent_integration.py` | Created comprehensive integration test suite running against backend database and services. |
| `incident-investigation-agent/app/main.py` | **DELETE** | *N/A (Obsolete Duplicate)* | Duplicate standalone FastAPI app. `backend/app/main.py` is the sole server entry point. |
| `incident-investigation-agent/app/database.py` | **DELETE** | *N/A (Obsolete Duplicate)* | Duplicate database engine. `backend/app/core/database.py` owns `sentinelx.db`. |
| `incident-investigation-agent/app/config.py` | **DELETE** | *N/A (Obsolete Duplicate)* | Duplicate configuration class. `backend/app/core/config.py` is canonical. |
| `incident-investigation-agent/app/models/engine.py` | **DELETE** | *N/A (Obsolete Duplicate)* | Duplicate SQLAlchemy models. `backend/app/models/models.py` owns all models. |
| `incident-investigation-agent/app/api/` | **DELETE** | *N/A (Obsolete Duplicate)* | Duplicate REST routes. `backend/app/api/v1/` owns all routes. |

---

## 3. Unified Capability Mapping

### A. RAG Capability
- **Before**: Two separate retrieval logic implementations. `incident-investigation-agent` had TF-IDF and static seed data; `backend` had simple SQL `ILIKE` queries.
- **After**: Merged into `backend/app/services/rag_service.py`. Automatically seeds `SEED_KNOWLEDGE_DOCUMENTS` if missing, evaluates TF-IDF cosine similarity, exact error-code matches, and automatically captures resolved incidents into `sentinelx.db`.

### B. Groq AI & RCA Capability
- **Before**: `backend` had simplified AI prompt strings; `incident-investigation-agent` had structured H1/H2/H3 hypothesis JSON models and `UNKNOWN` fallback.
- **After**: Unified in `backend/app/services/ai_service.py`. When operational telemetry is complete (Scenario 1), formulates hypotheses H1 and H2 and identifies connection pool leaks. When evidence is inadequate (Scenario 2), sets `probable_root_cause = "UNKNOWN"` with reasoning `"INSUFFICIENT_EVIDENCE"`.

### C. Layer 2 Policy & Human Approval
- **Before**: Action registries existed in both projects with minor schema mismatches.
- **After**: Unified in `backend/app/core/action_registry.py` and `backend/app/services/remediation_service.py`. `HIGH` risk actions like `ROLLBACK_DEPLOYMENT` set `approval_required=True` and transition to status `AWAITING_APPROVAL`.

### D. Remediation & Verification
- **Before**: Separate remediation controllers.
- **After**: Unified in `backend/app/services/remediation_service.py`. Simulates before/after operational metrics, independently checks recovery thresholds, transitions state to `RESOLVED`, and triggers automatic knowledge document capture.
