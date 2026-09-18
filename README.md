# Aegis Incident Command

### Autonomous Enterprise Incident Resolution Engine — Frontend Command Center

**Aegis Incident Command** is a modern, production-grade, dark-themed enterprise React frontend designed for an autonomous agentic AIOps incident resolution platform.

The system automates the operational lifecycle:
> **Detects → Filters → Correlates → Investigates → Finds Root Cause → Assesses Impact → Decides → Remediates → Verifies → Audits**

---

## Technical Stack

- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS with custom Dark Command-Center Palette
- **Routing**: React Router v6
- **Server State & Caching**: TanStack Query (React Query) v5
- **Interactive Graphs**: `@xyflow/react` (React Flow v12) for Root Cause Analysis (RCA) Causal Graphs
- **Telemetry Charts**: Recharts
- **Icons**: Lucide React
- **API Communication**: Axios with centralized abstraction layer & real-time WebSocket client

---

## Getting Started

### 1. Installation

```bash
npm install
```

### 2. Running Locally

```bash
npm run dev
```

The application will launch at `http://localhost:3000`.

### 3. Production Build & Local Serving

```bash
# Build the production bundle
npm run build

# Serve the production build locally
npm run serve
```

---

## Environment & Backend Configuration

The frontend communicates exclusively through a centralized API service layer (`src/api/`). No backend URLs or mock data implementations are hardcoded in UI components.

Create or edit `.env`:

```env
# Backend REST API URL (SQLite3 backend or production REST service)
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Real-time WebSocket Stream URL
VITE_WS_URL=ws://localhost:8000/ws

# Set 'true' for interactive demo mock mode, or 'false' for live backend API
VITE_USE_MOCK_API=true
```

---

## Live Hackathon Demo Engine

Click the **"Run Live Incident Demo"** button in the top navigation bar or trigger `POST /simulation/start`.

When in mock mode, the simulation engine drives real-time incident progression:
1. **Alert Storm** received across payment microservices.
2. **AI Correlation** connects 47 telemetry alerts into one incident (`INC-1042`).
3. **Investigation & RCA Graph** isolates Database Connection Exhaustion caused by deployment `v2.4.1`.
4. **AI Decision** recommends `ROLLBACK_DEPLOYMENT` (94% confidence).
5. **Human Approval Workflow** triggers approval modal.
6. **Remediation Execution** shows step-by-step progress bar & verification checklist.
7. **Verified Recovery** marks incident `RESOLVED` and appends to audit log.


---

## API Contract Specification

See [`docs/API_CONTRACT.md`](./docs/API_CONTRACT.md) for full REST endpoints, request/response models, and WebSocket event payloads.
