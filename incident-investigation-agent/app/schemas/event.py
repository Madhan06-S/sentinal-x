from datetime import datetime, timezone
from typing import Any, Literal
from pydantic import BaseModel, Field, field_validator


def _utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class EventSchema(BaseModel):
    event_id: str
    source: Literal["application", "github", "simulator", "system"] = "application"
    event_type: str  # e.g., "error", "deployment", "warning", "info", "metric_spike"
    service: str = "unknown-service"
    severity: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    timestamp: str = Field(default_factory=_utcnow_iso)
    error_code: str | None = None
    message: str = ""
    metadata: dict[str, Any] = Field(default_factory=dict)
    fingerprint: str | None = None
    filter_status: Literal["KEEP", "DEPRIORITIZE", "IGNORE"] = "KEEP"

    @field_validator("severity", mode="before")
    @classmethod
    def normalize_severity(cls, v: Any) -> str:
        if isinstance(v, str):
            val = v.upper().strip()
            if val in {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}:
                return val
            if val in {"HIGH", "FATAL"}:
                return "CRITICAL"
            if val in {"WARN"}:
                return "WARNING"
        return "INFO"


class LogIngestionPayload(BaseModel):
    timestamp: str | None = None
    service: str = "payment-service"
    level: str = "ERROR"
    error_code: str | None = None
    message: str = ""
    request_id: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
