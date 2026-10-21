from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./homelibrary.db"
    OPEN_LIBRARY_URL: str = "https://openlibrary.org/api/books"
    GOOGLE_BOOKS_URL: str = "https://www.googleapis.com/books/v1/volumes"
    APP_HOST: str = "127.0.0.1"
    APP_PORT: int = 8000
    COVERS_DIR: Path = Path("./storage/covers")
    DEBUG: bool = True
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
