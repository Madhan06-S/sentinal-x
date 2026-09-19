import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Autonomous Enterprise Incident Resolution Engine"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PORT: int = int(os.getenv("PORT", "8000"))

    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    CORS_ORIGINS: list[str] = ["*"]

    DATABASE_PATH: str = os.getenv("DATABASE_PATH", "./aegis.db")

    @property
    def DATABASE_URL(self) -> str:
        path = self.DATABASE_PATH.strip()
        if path.startswith("sqlite+aiosqlite://"):
            return path
        if path.startswith("sqlite://"):
            return path.replace("sqlite://", "sqlite+aiosqlite://")
        return f"sqlite+aiosqlite:///{path}"

    AI_LAYER_1_URL: str = "http://localhost:8001/api/v1"
    AI_LAYER_2_URL: str = "http://localhost:8002/api/v1"
    AI_LAYER_1_MOCK: bool = True
    AI_LAYER_2_MOCK: bool = True
    AI_HTTP_TIMEOUT_SECONDS: float = 30.0

    SECRET_KEY: str = os.getenv("SECRET_KEY", "sentinel-x-secret-key-prod")

    ALERT_DEDUP_WINDOW_SECONDS: int = 120
    INCIDENT_CORRELATION_WINDOW_SECONDS: int = 900
    ANALYSIS_DEBOUNCE_SECONDS: float = 3.0
    AUTO_REMEDIATE_LOW_RISK: bool = True

    GITHUB_WEBHOOK_SECRET: str = os.getenv("GITHUB_WEBHOOK_SECRET", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
