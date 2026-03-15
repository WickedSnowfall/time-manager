from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import WorkSession
from app.time import utcnow_naive


def get_active_session(db: Session, user_id: int) -> WorkSession | None:
    return (
        db.query(WorkSession)
        .filter(WorkSession.user_id == user_id, WorkSession.end_time.is_(None))
        .order_by(WorkSession.start_time.desc())
        .first()
    )


def start_session(db: Session, user_id: int) -> WorkSession:
    session = WorkSession(user_id=user_id, start_time=utcnow_naive())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def stop_active_session(db: Session, user_id: int) -> WorkSession | None:
    session = get_active_session(db, user_id)
    if session is None:
        return None

    session.end_time = utcnow_naive()
    session.duration_seconds = max(int((session.end_time - session.start_time).total_seconds()), 0)
    db.commit()
    db.refresh(session)
    return session


def get_elapsed_seconds(session: WorkSession) -> int:
    return max(int((utcnow_naive() - session.start_time).total_seconds()), 0)
