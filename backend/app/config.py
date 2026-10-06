from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    APP_NAME: str = "Mission Operations Copilot Backend"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: List[str] = ["*"]

    # Database
    DATABASE_URL: str = "sqlite:///./mission_ops.db"

    # Vector Storage
    VECTOR_DB_PATH: str = str(BASE_DIR / "data" / "vector_store")
    CHROMA_COLLECTION_NAME: str = "mission_knowledge_base"

    # AI / LLM Configuration
    # Supported providers: 'ollama', 'gemini', 'openai', 'anthropic', 'mock'
    LLM_PROVIDER: str = "ollama"
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL: str = "llama3"
    LLM_API_BASE: Optional[str] = None
    LLM_TEMPERATURE: float = 0.2
    LLM_FALLBACK_TO_MOCK: bool = True

    # Google Gemini Configuration
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"
    GEMINI_API_BASE: str = "https://generativelanguage.googleapis.com/v1beta/openai"

    # Ollama Local Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    # Spacecraft & Simulation Guardrails
    SIMULATION_MODE: bool = True
    SPACECRAFT_ID: str = "SC-01"
    ALLOW_HARDWARE_COMMANDS: bool = False

    # Data file directories
    DATA_DIR: Path = BASE_DIR / "data"
    TELEMETRY_DIR: Path = BASE_DIR / "data" / "telemetry"
    LOGS_DIR: Path = BASE_DIR / "data" / "logs"
    PROCEDURES_DIR: Path = BASE_DIR / "data" / "procedures"
    INCIDENTS_DIR: Path = BASE_DIR / "data" / "incidents"

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
