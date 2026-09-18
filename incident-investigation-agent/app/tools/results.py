from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.schemas.evidence import SourceResult
from app.security import sanitize_error


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def ok(source: str, data: Any) -> SourceResult:
    return SourceResult(source=source, status="ok", data=data, collected_at=now_utc())


def unavailable(source: str, error: str) -> SourceResult:
    return SourceResult(source=source, status="unavailable", error=error, collected_at=now_utc())


def errored(source: str, exc: BaseException | str) -> SourceResult:
    return SourceResult(
        source=source,
        status="error",
        error=sanitize_error(exc),
        collected_at=now_utc(),
    )
