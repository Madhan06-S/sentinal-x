from functools import lru_cache
from typing import Any

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-120b"

    database_url: str = "sqlite:///./data/incident_engine.db"


    github_token: str = ""
    github_repository: str = ""
    github_webhook_secret: str = ""

    log_api_url: str = ""
    log_api_token: str = ""

    app_host: str = "0.0.0.0"
    app_port: int = 8000
    log_level: str = "INFO"

    groq_timeout: float = 45.0
    github_timeout: float = 15.0
    log_api_timeout: float = 15.0

    @field_validator(
        "groq_api_key",
        "github_token",
        "github_repository",
        "github_webhook_secret",
        "log_api_url",
        "log_api_token",
        mode="before",
    )
    @classmethod
    def strip_optional(cls, value: Any) -> Any:
        if isinstance(value, str):
            return value.strip()
        return value

    def integration_status(self) -> dict[str, dict[str, Any]]:
        return {
            "groq": {
                "configured": bool(self.groq_api_key),
                "model": self.groq_model if self.groq_api_key else None,
            },
            "github": {
                "configured": bool(self.github_token and self.github_repository),
                "repository": self.github_repository or None,
                "webhook_configured": bool(self.github_webhook_secret),
            },
            "logs": {
                "configured": bool(self.log_api_url),
            },
            "database": {
                "configured": True,
                "engine": "sqlite",
            },
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()

