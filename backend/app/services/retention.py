from __future__ import annotations

from datetime import timedelta

from sqlalchemy.orm import Session

from app.config import settings
from app.models import DayEntry, WorkSession
from app.time import utcnow_naive


def cleanup_old_data(db: Session, user_id: int) -> None:
    cutoff_datetime = utcnow_naive() - timedelta(days=settings.retention_days)
    cutoff_date = cutoff_datetime.date()

    deleted_sessions = db.query(WorkSession).filter(
        WorkSession.user_id == user_id,
        WorkSession.start_time < cutoff_datetime,
    ).delete(synchronize_session=False)

    deleted_entries = db.query(DayEntry).filter(
        DayEntry.user_id == user_id,
        DayEntry.entry_date < cutoff_date,
    ).delete(synchronize_session=False)

    if deleted_sessions or deleted_entries:
        db.commit()
