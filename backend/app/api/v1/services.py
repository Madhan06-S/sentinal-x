from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.schemas import ServiceDetailResponse, ServiceResponse
from app.services.catalog_service import get_service_by_id, list_services

router = APIRouter()


@router.get("", response_model=list[ServiceResponse])
async def list_catalog_services(db: AsyncSession = Depends(get_db)):
    return await list_services(db)


@router.get("/{service_id}", response_model=ServiceDetailResponse)
async def get_catalog_service(service_id: str, db: AsyncSession = Depends(get_db)):
    service = await get_service_by_id(db, service_id)
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    from app.services.catalog_service import list_services
    by_id = {item.id: item.name for item in await list_services(db)}
    return ServiceDetailResponse(
        **ServiceResponse.model_validate(service).model_dump(),
        depends_on=[by_id.get(dep.target_service_id, dep.target_service_id) for dep in service.outgoing_dependencies],
        depended_by=[by_id.get(dep.source_service_id, dep.source_service_id) for dep in service.incoming_dependencies],
    )
