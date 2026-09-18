from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


SourceStatus = Literal["ok", "unavailable", "error"]


class SourceResult(BaseModel):
    source: str
    status: SourceStatus
    error: str | None = None
    data: Any = None
    collected_at: datetime | None = None


class EvidenceItem(BaseModel):
    id: str
    type: str
    description: str
    timestamp: datetime | None = None
    source: str
    service: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("timestamp", mode="before")
    @classmethod
    def parse_timestamp(cls, value: Any) -> Any:
        if value in (None, ""):
            return None
        if isinstance(value, datetime):
            return value
        if isinstance(value, (int, float)):
            return datetime.fromtimestamp(value, tz=timezone.utc)
        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value.replace("Z", "+00:00"))
            except ValueError:
                return None
        return None


class CorrelationLink(BaseModel):
    left_id: str
    right_id: str
    reason: str
    score: float = Field(ge=0.0, le=1.0)
    details: dict[str, Any] = Field(default_factory=dict)


class CandidateCause(BaseModel):
    id: str
    cause: str
    confidence: float = Field(ge=0.0, le=1.0)
    supporting_evidence: list[str] = Field(default_factory=list)
    contradicting_evidence: list[str] = Field(default_factory=list)
    deterministic_score: float | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
