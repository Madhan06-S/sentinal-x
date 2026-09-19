from fastapi import APIRouter, Depends, Request, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.github_service import verify_signature, normalize_github_event
from app.services.event_service import process_event
from app.models.models import AlertStatus
from app.core.logging import logger
import json

router = APIRouter()

@router.post("/webhook")
async def github_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    event_type = request.headers.get("X-GitHub-Event")
    delivery_id = request.headers.get("X-GitHub-Delivery")
    signature = request.headers.get("X-Hub-Signature-256")
    
    if not event_type or not delivery_id:
        raise HTTPException(status_code=400, detail="Missing required GitHub headers")
        
    payload_body = await request.body()
    
    if not verify_signature(payload_body, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")
        
    if event_type == "ping":
        logger.info("Received GitHub ping event (Delivery: %s)", delivery_id)
        return {"status": "ok", "event": "ping"}
        
    try:
        payload = json.loads(payload_body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Malformed JSON")

    if event_type not in ["push", "deployment", "deployment_status"]:
        logger.info("Ignoring unsupported GitHub event type: %s", event_type)
        return {"status": "ignored", "event_type": event_type}
        
    from app.services.event_service import get_event_by_event_id, process_event
    existing = await get_event_by_event_id(db, delivery_id)
    if existing:
        logger.info("Duplicate GitHub delivery header received (Delivery: %s)", delivery_id)
        return {"status": "duplicate", "delivery_id": delivery_id}

    normalized_event = normalize_github_event(event_type, delivery_id, payload)
    
    if normalized_event:
        saved_alert = await process_event(db, normalized_event)
        logger.info("Successfully processed GitHub %s event (Delivery: %s)", event_type, delivery_id)
        return {"status": "processed", "event_id": saved_alert.event_id}
        
    return {"status": "ignored", "event_type": event_type}


