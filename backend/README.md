# Autonomous Enterprise Incident Resolution Engine - Backend

Backend orchestration layer. The frontend and AI layers talk only to this API. SQLite is the database for the hackathon; there is no Docker requirement.

## Requirements

- Python 3.12+

## Setup

```bash
python -m venv venv
# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
```

Tables are created on startup. Optional Alembic:

```bash
alembic upgrade head
```

If you already have an old `sentinelx.db` from before the catalog/AI tables existed, delete it once and restart so SQLite can recreate the schema.

```bash
uvicorn app.main:app --reload --port 8000
```

- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- Health: `GET /api/v1/health`
- WebSocket: `ws://localhost:8000/api/v1/ws/`

## Frontend contract

`VITE_API_BASE_URL=http://localhost:8000/api/v1`

Canonical routes:

```text
GET/POST /alerts
GET      /alerts/{id}

GET      /incidents
GET      /incidents/{id}
GET      /incidents/{id}/alerts
GET      /incidents/{id}/timeline
GET      /incidents/{id}/audit
GET      /incidents/{id}/graph
POST     /incidents/{id}/analyze
POST     /incidents/{id}/approve
POST     /incidents/{id}/reject
POST     /incidents/{id}/remediate

GET      /services
GET      /services/{id}
GET      /deployments
GET      /audit
GET      /health
POST     /simulation/start

POST     /webhooks/alertmanager
POST     /webhooks/github
POST     /webhooks/kubernetes
```

Approve payload:

```json
{ "approved_by": "sre-oncall", "comment": "Looks correct" }
```

## AI layer contract

Set `AI_LAYER_1_MOCK=false` / `AI_LAYER_2_MOCK=false` when those services are live.

- Layer 1: `POST {AI_LAYER_1_URL}/analyze`
- Layer 2: `POST {AI_LAYER_2_URL}/decide`
- Layer 2 optional: `POST {AI_LAYER_2_URL}/verify`

The backend is the security boundary: AI decisions are validated against the action registry and risk policy before anything is executed. The AI never runs shell commands.

## Demo

```bash
curl -X POST http://localhost:8000/api/v1/simulation/start
```

This emits a bad-deployment cascade (memory spike → DB exhaustion → API timeout → payment failure), correlates it into one incident, runs RCA + decision, and waits for human approval on `ROLLBACK_DEPLOYMENT`.
