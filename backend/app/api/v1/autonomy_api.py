from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from app.core.autonomy import autonomy_manager
from app.core.realtime import publish

router = APIRouter()

class AutonomyUpdateRequest(BaseModel):
    autonomy_level: Optional[str] = Field(None, alias="level")
    level: Optional[str] = None

@router.get("/")
@router.get("")
async def get_autonomy_level():
    return autonomy_manager.get_details()

@router.post("/")
@router.post("")
async def update_autonomy_level(request: AutonomyUpdateRequest):
    requested_level = request.autonomy_level or request.level
    if not requested_level:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'autonomy_level' or 'level' is required"
        )
    try:
        updated_details = autonomy_manager.set_level(requested_level)
        await publish("autonomy.updated", updated_details)
        return updated_details
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
