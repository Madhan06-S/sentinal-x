from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.schemas import DeploymentResponse
from app.services.catalog_service import list_deployments

router = APIRouter()


@router.get("/", response_model=list[DeploymentResponse])
async def list_catalog_deployments(service_id: str | None = Query(default=None), db: AsyncSession = Depends(get_db)):
    return await list_deployments(db, service_id=service_id)
