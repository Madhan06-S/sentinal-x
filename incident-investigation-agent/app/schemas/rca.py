from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

from app.schemas.evidence import CandidateCause, EvidenceItem, SourceResult


InvestigationStatus = Literal[
    "completed",
    "completed_with_gaps",
    "failed",
    "in_progress",
]


class RootCause(BaseModel):
    summary: str
    confidence: float = Field(ge=0.0, le=1.0)
    candidate_id: str | None = None


class RCAResponse(BaseModel):
    investigation_id: str
    incident_id: str
    status: InvestigationStatus
    root_cause: RootCause | None = None
    affected_services: list[str] = Field(default_factory=list)
    evidence: list[EvidenceItem] = Field(default_factory=list)
    candidate_causes: list[CandidateCause] = Field(default_factory=list)
    backtracking_path: list[str] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)
    recommended_next_investigation: str | None = None
    sources: list[SourceResult] = Field(default_factory=list)
    correlations: list[dict[str, Any]] = Field(default_factory=list)
    confidence_methodology: dict[str, Any] = Field(default_factory=dict)
    investigation_start: datetime | None = None
    investigation_end: datetime | None = None
    errors: list[dict[str, str]] = Field(default_factory=list)
