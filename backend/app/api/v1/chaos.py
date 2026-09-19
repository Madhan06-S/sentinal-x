from fastapi import APIRouter, Body
from pydantic import BaseModel
from typing import Optional
from app.services.simulator_service import inject_chaos, clear_chaos, get_simulator_status

router = APIRouter()


class ChaosInjectRequest(BaseModel):
    service: str
    failure: str
    intensity: Optional[float] = 0.8


@router.post("/inject")
async def inject_chaos_endpoint(request: ChaosInjectRequest):
    res = inject_chaos(request.service, request.failure, request.intensity or 0.8)
    return res


@router.post("/clear")
async def clear_chaos_endpoint():
    res = clear_chaos()
    return res


@router.get("/status")
async def chaos_status_endpoint():
    return get_simulator_status()
