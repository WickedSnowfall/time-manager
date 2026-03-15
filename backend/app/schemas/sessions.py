from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class ActiveSessionResponse(BaseModel):
    active: bool
    session_id: int | None = None
    start_time: datetime | None = None
    elapsed_seconds: int = 0


class SessionActionResponse(BaseModel):
    status: Literal["started", "stopped"]
    session_id: int
    start_time: datetime | None = None
    end_time: datetime | None = None
    duration_seconds: int | None = None
    message: str | None = None
