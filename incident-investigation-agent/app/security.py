import re
from typing import Any

_SECRET_KEYS = {
    "authorization",
    "api_key",
    "apikey",
    "token",
    "secret",
    "password",
    "groq_api_key",
    "github_token",
    "log_api_token",
}

_BEARER_RE = re.compile(r"(?i)(bearer\s+)[A-Za-z0-9._\-]+")
_KEY_RE = re.compile(r"(?i)(api[_-]?key|token|secret)([\"']?\s*[:=]\s*[\"']?)[^\\s\"']+")


def sanitize_error(exc: BaseException | str) -> str:
    text = str(exc)
    text = _BEARER_RE.sub(r"\1[redacted]", text)
    text = _KEY_RE.sub(r"\1\2[redacted]", text)
    if len(text) > 500:
        text = text[:497] + "..."
    return text


def redact_mapping(data: dict[str, Any]) -> dict[str, Any]:
    redacted: dict[str, Any] = {}
    for key, value in data.items():
        if key.lower() in _SECRET_KEYS or any(part in key.lower() for part in ("token", "secret", "password", "api_key")):
            redacted[key] = "[redacted]"
        elif isinstance(value, dict):
            redacted[key] = redact_mapping(value)
        else:
            redacted[key] = value
    return redacted
