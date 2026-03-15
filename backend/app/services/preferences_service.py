from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import UserPreference
from app.schemas import PreferencesResponse, PreferencesUpdateRequest


def get_or_create_preferences(db: Session, user_id: int) -> UserPreference:
    prefs = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    if prefs is not None:
        return prefs

    prefs = UserPreference(user_id=user_id)
    db.add(prefs)
    db.commit()
    db.refresh(prefs)
    return prefs


def to_preferences_response(prefs: UserPreference) -> PreferencesResponse:
    return PreferencesResponse(
        language=prefs.language,
        theme_mode=prefs.theme_mode,
        primary_color=prefs.custom_primary,
        background_color=prefs.custom_background,
        surface_color=prefs.custom_surface,
        text_color=prefs.custom_text,
    )


def update_preferences(
    db: Session,
    prefs: UserPreference,
    payload: PreferencesUpdateRequest,
) -> UserPreference:
    prefs.language = payload.language
    prefs.theme_mode = payload.theme_mode
    prefs.custom_primary = payload.primary_color
    prefs.custom_background = payload.background_color
    prefs.custom_surface = payload.surface_color
    prefs.custom_text = payload.text_color

    db.commit()
    db.refresh(prefs)
    return prefs
