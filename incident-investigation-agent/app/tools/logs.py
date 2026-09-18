from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any

import httpx

from app.config import Settings, get_settings
from app.schemas.evidence import SourceResult
from app.tools.results import errored, ok, unavailable


class LogProvider(ABC):
    """Pluggable log search. Concrete providers must query real systems only."""

    name: str = "logs"

    @abstractmethod
    def configured(self) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def search(
        self,
        *,
        query: str,
        start: datetime | None = None,
        end: datetime | None = None,
        service: str | None = None,
        limit: int = 50,
    ) -> SourceResult:
        raise NotImplementedError


class HttpLogProvider(LogProvider):
    """Generic HTTP log API. Expects a JSON search interface at LOG_API_URL."""

    name = "logs"

    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()

    def configured(self) -> bool:
        return bool(self.settings.log_api_url)

    def _headers(self) -> dict[str, str]:
        headers = {"Accept": "application/json"}
        if self.settings.log_api_token:
            headers["Authorization"] = f"Bearer {self.settings.log_api_token}"
        return headers

    async def search(
        self,
        *,
        query: str,
        start: datetime | None = None,
        end: datetime | None = None,
        service: str | None = None,
        limit: int = 50,
    ) -> SourceResult:
        if not self.configured():
            return unavailable("logs", "LOG_API_URL is not configured")
        payload: dict[str, Any] = {"query": query, "limit": limit}
        if start:
            payload["start"] = start.isoformat()
        if end:
            payload["end"] = end.isoformat()
        if service:
            payload["service"] = service
        try:
            async with httpx.AsyncClient(timeout=self.settings.log_api_timeout) as client:
                response = await client.post(
                    self.settings.log_api_url,
                    json=payload,
                    headers=self._headers(),
                )
                response.raise_for_status()
                data = response.json()
            return ok("logs", data)
        except Exception as exc:
            return errored("logs", exc)


class UnavailableLogProvider(LogProvider):
    name = "logs"

    def configured(self) -> bool:
        return False

    async def search(self, **kwargs) -> SourceResult:  # noqa: ANN003
        return unavailable("logs", "no log provider is configured")


def get_log_provider(settings: Settings | None = None) -> LogProvider:
    settings = settings or get_settings()
    if settings.log_api_url:
        return HttpLogProvider(settings)
    return UnavailableLogProvider()


async def search_logs(
    query: str,
    start: datetime | None = None,
    end: datetime | None = None,
    service: str | None = None,
) -> SourceResult:
    return await get_log_provider().search(query=query, start=start, end=end, service=service)
