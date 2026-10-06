from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./homelibrary.db"
    OPEN_LIBRARY_URL: str
    GOOGLE_BOOKS_URL: str
    COVERS_DIR: Path = Path("./storage/covers")
    DEBUG: bool = True
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    
    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
