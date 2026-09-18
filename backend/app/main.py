from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.config import settings
from app.core.database import AsyncSessionLocal, init_db
from app.core.logging import setup_logging, logger
from app.core.seed import seed_catalog
from app.api.v1 import (
    alerts,
    approvals,
    audit,
    deployments,
    incidents,
    remediation,
    services,
    simulation,
    webhooks,
    websockets,
    events,
)
from app.api.v1.integrations import github


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info("Starting %s in %s mode", settings.PROJECT_NAME, settings.ENVIRONMENT)
    await init_db()
    async with AsyncSessionLocal() as session:
        await seed_catalog(session)
    yield
    logger.info("Shutting down application")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Backend orchestration layer for the Autonomous Enterprise Incident Resolution Engine. "
        "The frontend and AI layers integrate only through this API."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    logger.warning("ValueError: %s", exc)
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled Exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "message": str(exc)},
    )


@app.get("/api/v1/health")
async def health_check():
    db_ok = True
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
    except Exception as exc:
        db_ok = False
        logger.error("Health check database error: %s", exc)
    return {
        "status": "ok" if db_ok else "degraded",
        "environment": settings.ENVIRONMENT,
        "database": "up" if db_ok else "down",
        "ai_layer_1_mock": settings.AI_LAYER_1_MOCK,
        "ai_layer_2_mock": settings.AI_LAYER_2_MOCK,
    }


app.include_router(events.router, prefix="/api/v1/events", tags=["Events"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])
app.include_router(incidents.router, prefix="/api/v1/incidents", tags=["Incidents"])
app.include_router(services.router, prefix="/api/v1/services", tags=["Services"])
app.include_router(deployments.router, prefix="/api/v1/deployments", tags=["Deployments"])
app.include_router(remediation.router, prefix="/api/v1/remediation", tags=["Remediation"])
app.include_router(approvals.router, prefix="/api/v1/approvals", tags=["Approvals"])
app.include_router(audit.router, prefix="/api/v1/audit", tags=["Audit"])
app.include_router(simulation.router, prefix="/api/v1/simulation", tags=["Simulation"])
app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["Webhooks"])
app.include_router(websockets.router, prefix="/api/v1/ws", tags=["WebSockets"])
app.include_router(github.router, prefix="/api/v1/integrations/github", tags=["Integrations"])

from fastapi.responses import FileResponse
from pathlib import Path

@app.get("/", response_class=FileResponse, include_in_schema=False)
async def serve_dashboard():
    html_path = Path(__file__).parent / "static" / "index.html"
    return FileResponse(html_path)
