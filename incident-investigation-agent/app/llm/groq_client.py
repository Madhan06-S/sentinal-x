from __future__ import annotations

import json
from typing import Any

from groq import AsyncGroq

from app.config import Settings, get_settings
from app.security import sanitize_error


class GroqNotConfiguredError(RuntimeError):
    pass


class GroqClient:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self._client: AsyncGroq | None = None

    def configured(self) -> bool:
        return bool(self.settings.groq_api_key)

    def _get_client(self) -> AsyncGroq:
        if not self.configured():
            raise GroqNotConfiguredError("GROQ_API_KEY is not configured")
        if self._client is None:
            self._client = AsyncGroq(
                api_key=self.settings.groq_api_key,
                timeout=self.settings.groq_timeout,
            )
        return self._client

    async def complete_json(self, *, system: str, user: str) -> dict[str, Any]:
        client = self._get_client()
        completion = await client.chat.completions.create(
            model=self.settings.groq_model,
            temperature=0.1,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        )
        content = completion.choices[0].message.content or "{}"
        try:
            parsed = json.loads(content)
        except json.JSONDecodeError as exc:
            raise RuntimeError(sanitize_error(f"Groq returned non-JSON output: {exc}")) from exc
        if not isinstance(parsed, dict):
            raise RuntimeError("Groq JSON payload was not an object")
        return parsed
