from fastapi import APIRouter
from app.services.simulator_service import run_scenario, get_simulator_status
import asyncio

router = APIRouter()

@router.post("/start")
async def start_simulation(scenario: str | None = None):
    status = get_simulator_status()
    if status.get("running"):
        return {"status": "already_running", "scenario": status.get("scenario")}
        
    scenario_name = scenario or "cascade"
    asyncio.create_task(run_scenario(scenario_name))
    
    return {"status": "Simulation started", "scenario": scenario_name}

@router.get("/status")
async def get_simulation_status():
    return get_simulator_status()
