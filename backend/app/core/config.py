from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Autonomous Enterprise Incident Resolution Engine"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: list[str] = ["*"]

    DATABASE_URL: str = "sqlite+aiosqlite:///./sentinelx.db"

    AI_LAYER_1_URL: str = "http://localhost:8001/api/v1"
    AI_LAYER_2_URL: str = "http://localhost:8002/api/v1"
    AI_LAYER_1_MOCK: bool = True
    AI_LAYER_2_MOCK: bool = True
    AI_HTTP_TIMEOUT_SECONDS: float = 30.0

    SECRET_KEY: str = "change-me"

    ALERT_DEDUP_WINDOW_SECONDS: int = 120
    INCIDENT_CORRELATION_WINDOW_SECONDS: int = 900
    ANALYSIS_DEBOUNCE_SECONDS: float = 3.0
    AUTO_REMEDIATE_LOW_RISK: bool = True

    GITHUB_WEBHOOK_SECRET: str = ""
    
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
