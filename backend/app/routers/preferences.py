from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_active_user_id
from app.schemas import PreferencesResponse, PreferencesUpdateRequest
from app.services.preferences_service import (
    get_or_create_preferences,
    to_preferences_response,
    update_preferences as update_preferences_record,
)

router = APIRouter(prefix="/api/preferences", tags=["preferences"])


@router.get("", response_model=PreferencesResponse)
def get_preferences(
    db: Session = Depends(get_db), user_id: int = Depends(get_active_user_id)
) -> PreferencesResponse:
    prefs = get_or_create_preferences(db, user_id)
    return to_preferences_response(prefs)


@router.put("", response_model=PreferencesResponse)
def update_preferences(
    payload: PreferencesUpdateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_active_user_id),
) -> PreferencesResponse:
    prefs = get_or_create_preferences(db, user_id)
    updated = update_preferences_record(db, prefs, payload)
    return to_preferences_response(updated)
