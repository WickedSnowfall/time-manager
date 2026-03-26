from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import LanguageCode, ThemeMode, User, UserPreference


def ensure_preferences_for_user(db: Session, user: User) -> UserPreference:
    if user.preferences:
        return user.preferences

    prefs = UserPreference(
        user_id=user.id,
        language=LanguageCode.UK,
        theme_mode=ThemeMode.SYSTEM,
    )
    db.add(prefs)
    db.commit()
    db.refresh(prefs)
    return prefs
