from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_active_user_id
from app.schemas import ActiveSessionResponse, SessionActionResponse
from app.services import upsert_day_entry_from_sessions
from app.services.sessions_service import (
    get_active_session,
    get_elapsed_seconds,
    start_session as start_session_record,
    stop_active_session,
)

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.get("/active", response_model=ActiveSessionResponse)
def active_session(
    db: Session = Depends(get_db), user_id: int = Depends(get_active_user_id)
) -> ActiveSessionResponse:
    active = get_active_session(db, user_id)
    if not active:
        return ActiveSessionResponse(active=False)

    return ActiveSessionResponse(
        active=True,
        session_id=active.id,
        start_time=active.start_time,
        elapsed_seconds=get_elapsed_seconds(active),
    )


@router.post("/start", response_model=SessionActionResponse)
def start_session(
    db: Session = Depends(get_db), user_id: int = Depends(get_active_user_id)
) -> SessionActionResponse:
    existing = get_active_session(db, user_id)
    if existing:
        raise HTTPException(status_code=400, detail="Active session already exists")

    session = start_session_record(db, user_id)

    return SessionActionResponse(
        status="started",
        session_id=session.id,
        start_time=session.start_time,
        message="Session started",
    )


@router.post("/stop", response_model=SessionActionResponse)
def stop_session(
    db: Session = Depends(get_db), user_id: int = Depends(get_active_user_id)
) -> SessionActionResponse:
    session = stop_active_session(db, user_id)
    if not session:
        raise HTTPException(status_code=400, detail="No active session")

    upsert_day_entry_from_sessions(db, user_id, session.start_time.date())

    return SessionActionResponse(
        status="stopped",
        session_id=session.id,
        duration_seconds=session.duration_seconds,
        message="Session saved",
    )
