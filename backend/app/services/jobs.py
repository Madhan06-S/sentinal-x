import asyncio
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.logging import logger

ENABLED = True
_analysis_tasks: dict[str, asyncio.Task] = {}
_remediation_tasks: dict[str, asyncio.Task] = {}
_verification_tasks: dict[str, asyncio.Task] = {}


def _cancel(task: asyncio.Task | None) -> None:
    if task and not task.done():
        task.cancel()


def schedule_analysis(incident_id: str) -> None:
    if not ENABLED:
        return
    _cancel(_analysis_tasks.get(incident_id))

    async def _run() -> None:
        await asyncio.sleep(settings.ANALYSIS_DEBOUNCE_SECONDS)
        from app.services.ai_service import run_ai_analysis_pipeline

        async with AsyncSessionLocal() as session:
            await run_ai_analysis_pipeline(session, incident_id)

    _analysis_tasks[incident_id] = asyncio.create_task(_run())
    logger.info("Scheduled AI analysis for %s", incident_id)


def schedule_remediation(incident_id: str) -> None:
    if not ENABLED:
        return
    _cancel(_remediation_tasks.get(incident_id))

    async def _run() -> None:
        from app.services.remediation_service import execute_remediation

        async with AsyncSessionLocal() as session:
            await execute_remediation(session, incident_id)

    _remediation_tasks[incident_id] = asyncio.create_task(_run())


def schedule_verification(incident_id: str) -> None:
    if not ENABLED:
        return
    _cancel(_verification_tasks.get(incident_id))

    async def _run() -> None:
        await asyncio.sleep(1)
        from app.services.remediation_service import verify_remediation

        async with AsyncSessionLocal() as session:
            await verify_remediation(session, incident_id)

    _verification_tasks[incident_id] = asyncio.create_task(_run())
