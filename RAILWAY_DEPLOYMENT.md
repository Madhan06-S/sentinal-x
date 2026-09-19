# Sentinel-X: Railway Production Deployment Guide

This guide provides step-by-step instructions for deploying the **Sentinel-X Autonomous Enterprise Incident Resolution Engine** on **Railway**.

---

## Architecture Overview

- **Backend**: FastAPI + Python (Uvicorn, WebSockets, background asyncio simulator loop)
- **Database**: SQLite3 with `PRAGMA journal_mode=WAL;` and `PRAGMA foreign_keys=ON;`
- **Frontend**: React + Vite (production build dist/, static SPA preview)
- **AI Engine**: Groq API (server-side RAG & multi-agent reasoning, zero secret exposure to client)
- **Real-Time Telemetry**: WebSockets with auto-reconnect and exponential backoff

---

## Railway Environment Variables Reference

### Backend Service Variables
| Variable Name | Example Value | Description |
|---|---|---|
| `GROQ_API_KEY` | `gsk_abc123...` | Groq API Key for LLM reasoning |
| `DATABASE_PATH` | `./aegis.db` or `/data/aegis.db` | SQLite database file path |
| `FRONTEND_URL` | `https://sentinel-x-frontend.up.railway.app` | Railway frontend origin for CORS |
| `PORT` | Set automatically by Railway | Port FastAPI listens on (`0.0.0.0:$PORT`) |
| `ENVIRONMENT` | `production` | Environment mode |
| `SECRET_KEY` | `your-prod-secret` | Application security secret |

### Frontend Service Variables
| Variable Name | Example Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://sentinel-x-backend.up.railway.app` | Backend URL (WebSockets automatically use `wss://`) |
| `VITE_USE_MOCK_API` | `false` | Disables client mocks, connects to live backend |

---

## Step-by-Step Deployment Instructions

### STEP 1: Push Code to GitHub
Ensure all code and configuration changes are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure Sentinel-X for Railway production deployment"
git push origin main
```

### STEP 2: Create a Railway Project
1. Log in to [Railway.app](https://railway.app).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your `sentinel-x` repository.

---

### STEP 3: Deploy Backend Service
1. Select the `backend` folder as the Root Directory for the service (in **Settings** -> **Root Directory**: `backend`).
2. Set the Start Command (if not auto-detected from `backend/railway.json`):
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
3. Set the Healthcheck Path to `/health`.

---

### STEP 4: Configure Backend Environment Variables
In the backend service **Variables** tab, add:
- `GROQ_API_KEY` = `your_groq_api_key`
- `DATABASE_PATH` = `./aegis.db`
- `FRONTEND_URL` = `https://<YOUR-FRONTEND-SERVICE>.up.railway.app` (update after STEP 5)
- `ENVIRONMENT` = `production`

---

### STEP 5: Deploy Frontend Service Separately
1. In the same Railway project, click **+ New** -> **GitHub Repo** -> select `sentinel-x`.
2. In service settings, set **Root Directory** to `frontend`.
3. Set **Build Command**: `npm run build`
4. Set **Start Command**: `npm run start`

---

### STEP 6: Set `VITE_API_URL` on Frontend
In the frontend service **Variables** tab, add:
- `VITE_API_URL` = `https://<YOUR-BACKEND-SERVICE>.up.railway.app`
- `VITE_USE_MOCK_API` = `false`

*(Note: Sentinel-X automatically converts `https://` to `wss://` for live WebSockets).*

---

### STEP 7: Update `FRONTEND_URL` on Backend
Return to the backend service **Variables** tab and set `FRONTEND_URL` to your actual frontend Railway URL (e.g. `https://sentinel-x-frontend.up.railway.app`).

---

### STEP 8: Redeploy Both Services
Click **Redeploy** on both backend and frontend services to ensure environment variables and CORS headers take effect.

---

### STEP 9: Verify Backend Health Check
Open your browser or run:
```bash
curl https://<YOUR-BACKEND-SERVICE>.up.railway.app/health
```
Expected response:
```json
{
  "status": "ok",
  "service": "sentinel-x"
}
```

---

### STEP 10: Verify Live Telemetry & Frontend Connection
1. Open your frontend Railway URL: `https://<YOUR-FRONTEND-SERVICE>.up.railway.app`
2. Check the topbar status pills:
   - `WS: LIVE` (green pill indicating WebSocket connection established)
   - System metrics updating continuously every 2 seconds.

---

### STEP 11: Trigger Failure Injection (Chaos Engineering)
1. In the topbar, click **Failure Injection** (or navigate to `/ai-analysis`).
2. Click **Inject Failure** (or send `POST /chaos/inject` with `{"service": "payment-db", "failure": "connection_exhaustion"}`).

---

### STEP 12: Verify End-to-End Autonomous Resolution Flow
Observe the live workflow progress automatically:
1. **ALERT**: Connection pool breach detected.
2. **CORRELATION**: Signals grouped into incident cluster.
3. **INVESTIGATION**: Multi-agent RAG reasoning isolates memory leak in `v2.4.1`.
4. **SKEPTIC**: Challenges hypothesis against historical baseline.
5. **ROOT CAUSE & BLAST RADIUS**: Graph highlights degraded downstream services.
6. **DECISION**: Policy engine selects `ROLLBACK_DEPLOYMENT`.
7. **APPROVAL GATE**: Operator signoff requested (or auto-executed in L4).
8. **REMEDIATION & VERIFICATION**: Container pool restored, error rate drops < 5.0%.
9. **RESOLVED & AUDIT**: Case verdict archived with full JSON audit download.

---

## ⚠️ Important Railway SQLite Persistence Note

SQLite stores data in a local file (`aegis.db`). On Railway, container filesystems are ephemeral unless a **Railway Persistent Volume** is attached to the backend service at `/data` (with `DATABASE_PATH=/data/aegis.db`).

Sentinel-X automatically creates schema tables and seeds initial catalog data on startup (`init_db()` & `seed_catalog()`), ensuring full functionality out-of-the-box on every deployment without data loss or manual setup.
