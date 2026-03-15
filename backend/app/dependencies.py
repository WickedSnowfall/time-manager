from __future__ import annotations

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.db import get_db
from app.services import cleanup_old_data, ensure_user_exists


def get_user_id(x_user_id: int | None = Header(default=1)) -> int:
    return x_user_id or 1


def get_active_user_id(
    user_id: int = Depends(get_user_id),
    db: Session = Depends(get_db),
) -> int:
    username = "demo" if user_id == 1 else None
    ensure_user_exists(db, user_id=user_id, username=username)
    cleanup_old_data(db, user_id)
    return user_id
