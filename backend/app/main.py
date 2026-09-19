import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.config import settings
from app.core.database import AsyncSessionLocal, init_db
from app.core.logging import setup_logging, logger
from app.core.seed import seed_catalog
from app.services.simulator_service import simulator_loop
from app.api.v1 import (
    alerts,
    approvals,
    audit,
    chaos,
    deployments,
    incidents,
    remediation,
    services,
    simulation,
    webhooks,
    websockets,
    events,
    autonomy_api,
)
from app.api.v1.integrations import github


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info("Starting %s in %s mode (port %s)", settings.PROJECT_NAME, settings.ENVIRONMENT, settings.PORT)
    await init_db()
    async with AsyncSessionLocal() as session:
        await seed_catalog(session)

    # Start live enterprise telemetry background simulator
    sim_task = asyncio.create_task(simulator_loop())
    logger.info("Live enterprise background simulator task launched")

    yield

    # Shutdown simulator task gracefully
    logger.info("Shutting down background tasks")
    sim_task.cancel()
    try:
        await sim_task
    except asyncio.CancelledError:
        pass
    logger.info("Application shutdown complete")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Backend orchestration layer for the Autonomous Enterprise Incident Resolution Engine. "
        "The frontend and AI layers integrate through this API."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://sentinel-x-1.onrender.com",
    "https://sentinel-x-nqm6.onrender.com",
]
if settings.FRONTEND_URL:
    clean_url = settings.FRONTEND_URL.strip().rstrip("/")
    if clean_url and clean_url not in cors_origins:
        cors_origins.append(clean_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else cors_origins,
    allow_origin_regex=r"https://.*\.onrender\.com",
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


@app.get("/health")
async def root_health():
    """Railway health check endpoint."""
    return {
        "status": "ok",
        "service": "sentinel-x"
    }


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
        "service": "sentinel-x",
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
app.include_router(simulation.router, prefix="/simulation", tags=["Simulation Alias"])
app.include_router(chaos.router, prefix="/api/v1/chaos", tags=["Chaos"])
app.include_router(chaos.router, prefix="/chaos", tags=["Chaos Alias"])
app.include_router(autonomy_api.router, prefix="/api/v1/autonomy", tags=["Autonomy"])
app.include_router(autonomy_api.router, prefix="/autonomy", tags=["Autonomy Alias"])
app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["Webhooks"])
app.include_router(websockets.router, prefix="/api/v1/ws", tags=["WebSockets"])
app.include_router(websockets.router, prefix="/ws", tags=["WebSockets Alias"])
app.include_router(github.router, prefix="/api/v1/integrations/github", tags=["Integrations"])
