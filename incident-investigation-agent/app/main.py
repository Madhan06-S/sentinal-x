from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.config import get_settings
from app.database import SessionLocal, init_db
from app.logging_config import configure_logging
from app.rag.knowledge_base import seed_knowledge_base_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    configure_logging(settings.log_level)
    init_db()
    with SessionLocal() as db:
        seed_knowledge_base_if_empty(db)
    yield


app = FastAPI(
    title="Autonomous Incident Resolution Engine",
    description=(
        "Open-source, lightweight incident investigation and safe remediation platform for student & indie developers."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.get("/")
async def root() -> dict:
    return {
        "service": "autonomous-incident-resolution-engine",
        "status": "online",
        "docs": "/docs",
        "api_v1": "/api/v1",
    }
