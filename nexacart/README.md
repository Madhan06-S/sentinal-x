# NexaCart — Monitored Demo Application

> **Tagline:** *Simple shopping. Secure payments.*  
> **Role:** The monitored e-commerce target application for the **Autonomous Enterprise Incident Resolution Engine**.

---

## 🎯 Architecture & Clean Separation

NexaCart is deliberately decoupled from the incident-resolution engine:

```
          NEXACART (Monitored Target)
          │  - High-availability E-Commerce App
          │  - Normal Customer Shopping Flow
          │  - Controlled 5-Stage Incident Simulator (/demo)
          │
          ├── Structured JSON Telemetry (POST /api/events)
          │   (DEP-001, MEM-101, DB-104, API-201, PAY-301)
          ▼
   INCIDENT ENGINE BACKEND (Port 8000)
          │  - Ingests & Normalizes signals
          │  - RAG Knowledge Base Retrieval
          │  - Groq AI Reasoning & Investigation
          │  - Action Approval (ROLLBACK_DEPLOYMENT)
          ▼
   SAFE REMEDIATION HOOK (POST /api/remediation)
          ▼
   HEALTH VERIFICATION (GET /api/health)
```

---

## 🚀 Quick Start (Local Run)

```bash
cd nexacart
npm install
npm run dev
```

The application will start immediately at:
**http://localhost:5173**

---

## 🛒 Customer User Flow

The regular storefront operates as a full-featured, professional enterprise commerce application:

1. **Home (`/`)**: Hero showcase, guarantees, featured and popular hardware categories.
2. **Products (`#/products`)**: 6 enterprise products (ApexBook Pro 16", SonicWave Elite ANC, Horizon 10 Pro, TactileForge Keyboard, PulseTrack V4, UltraView 34" Monitor) with search, filter, and sorting.
3. **Product Details (`#/product/:id`)**: Specifications, live stock counts, and quantity selector.
4. **Cart (`#/cart`)**: Dynamic tax, shipping calculation, and item adjustments.
5. **Checkout (`#/checkout`)**: Contact and delivery address collection.
6. **Payment (`#/payment`)**: 256-bit simulated gateway. When healthy, authorizes in ~800ms and generates an order confirmation.

---

## 🧪 Developer Incident Simulator (`#/demo` or `#/dev`)

Access the developer control deck by clicking the status badge in the navbar or visiting **`http://localhost:5173/#/demo`**.

### Scenario: Payment Service Degradation

Click **`[ START INCIDENT ]`** to trigger the deterministic, reproducible failure sequence:

| Elapsed | Stage | Error Code | Severity | Symptom / Description |
|---|---|---|---|---|
| **T+0s** | Phase 2: Deployment | `DEP-001` | `INFO` | Release v2.14.0 promoted to production by release-bot |
| **T+2s** | Phase 3: Memory Degradation | `MEM-101` | `WARNING` | Memory usage spikes to **94%** |
| **T+4s** | Phase 4: Database Saturation | `DB-104` | `CRITICAL` | Connection pool exhausted (**100/100 active connections**) |
| **T+5s** | Phase 5: Gateway Latency | `API-201` | `CRITICAL` | P99 API latency reaches **4.8s** |
| **T+8s** | Phase 6: Business Symptom | `PAY-301` | `CRITICAL` | Payment failure rate surges to **31%** |

### Business Symptom Test
During an active incident, visit **`#/payment`** and click **Authorize & Pay**. The gateway will simulate high latency followed by a realistic `503 Service Unavailable (PAY-301)` timeout error.

---

## 🔌 HTTP Endpoints for Incident Resolution Engine

| Method | Path | Description | Sample Output |
|---|---|---|---|
| `GET` | `/health` | Microservice liveness | `{"status": "healthy", "service": "nexacart"}` |
| `GET` | `/api/health` | Telemetry metrics | `{"status": "degraded", "memory_usage": 94, "db_connections": 100, "api_latency": 4.8, "payment_failure_rate": 31}` |
| `POST` | `/api/remediation` | Safe action hook | Payload: `{"action": "ROLLBACK_DEPLOYMENT"}` |

### Supported Remediation Actions:
- `ROLLBACK_DEPLOYMENT` (Restores metrics: Memory 45%, DB 42/100, Latency 180ms, Payment errors 0.8%)
- `RESTART_SERVICE`
- `RECOVER_DATABASE`
- `RESET_PAYMENT_SERVICE`

*Arbitrary shell commands and unapproved actions are rejected.*

---

## ⚙️ Configuration

Set in `.env`:
```env
VITE_INCIDENT_ENGINE_URL=http://localhost:8000
VITE_ENVIRONMENT=demo
```

If the incident engine backend is not running, NexaCart continues running smoothly in offline mode and buffers telemetry locally.
