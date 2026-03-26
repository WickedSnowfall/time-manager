from __future__ import annotations

from datetime import date, datetime, timedelta

from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from app.models import DayEntry, DayStatus, WorkSession


def upsert_day_entry_from_sessions(db: Session, user_id: int, target_date: date) -> DayEntry:
    start_of_day = datetime.combine(target_date, datetime.min.time())
    end_of_day = start_of_day + timedelta(days=1)

    total = db.query(func.coalesce(func.sum(WorkSession.duration_seconds), 0)).filter(
        WorkSession.user_id == user_id,
        WorkSession.end_time.is_not(None),
        and_(WorkSession.start_time >= start_of_day, WorkSession.start_time < end_of_day),
    ).scalar() or 0

    entry = db.query(DayEntry).filter(
        DayEntry.user_id == user_id,
        DayEntry.entry_date == target_date,
    ).first()

    if not entry:
        entry = DayEntry(
            user_id=user_id,
            entry_date=target_date,
            computed_seconds=int(total),
            status=DayStatus.WORKED,
            note="",
        )
        db.add(entry)
    else:
        entry.computed_seconds = int(total)

    db.commit()
    db.refresh(entry)
    return entry
