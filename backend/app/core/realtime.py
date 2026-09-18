from typing import Any
from fastapi import WebSocket
from app.core.logging import logger


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info("WebSocket client connected. Total clients: %s", len(self.active_connections))

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info("WebSocket client disconnected. Total clients: %s", len(self.active_connections))

    async def broadcast(self, message: dict[str, Any]) -> None:
        stale: list[WebSocket] = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as exc:
                logger.error("Failed to send WS message: %s", exc)
                stale.append(connection)
        for connection in stale:
            self.disconnect(connection)


manager = ConnectionManager()


async def publish(event_type: str, payload: dict[str, Any], incident_id: str | None = None) -> None:
    await manager.broadcast(
        {
            "type": event_type,
            "incident_id": incident_id,
            "payload": payload,
        }
    )
