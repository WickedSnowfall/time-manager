from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    database_url: str
    cors_origins: tuple[str, ...]
    retention_days: int


def _split_csv(value: str) -> tuple[str, ...]:
    items = [item.strip() for item in value.split(",")]
    return tuple(item for item in items if item)


settings = Settings(
    database_url=os.getenv("DATABASE_URL", "sqlite:///./time_manager.db"),
    cors_origins=_split_csv(
        os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    ),
    retention_days=int(os.getenv("RETENTION_DAYS", "183")),
)
