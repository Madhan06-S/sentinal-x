from fastapi import APIRouter, Depends, Request, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.github_service import verify_signature, normalize_github_event
from app.services.event_service import process_event
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
        logger.info(f"Received GitHub ping event (Delivery: {delivery_id})")
        return {"status": "ok", "event": "ping"}
        
    try:
        payload = json.loads(payload_body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Malformed JSON")

    if event_type not in ["push", "deployment", "deployment_status"]:
        logger.info(f"Ignoring unsupported GitHub event type: {event_type}")
        return {"status": "ignored", "event_type": event_type}
        
    normalized_event = normalize_github_event(event_type, delivery_id, payload)
    
    if normalized_event:
        saved_alert = await process_event(db, normalized_event)
        logger.info(f"Successfully processed GitHub {event_type} event (Delivery: {delivery_id})")
        return {"status": "processed", "event_id": saved_alert.event_id}
        
    return {"status": "ignored", "event_type": event_type}
