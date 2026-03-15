from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import LanguageCode, ThemeMode, User, UserPreference


def ensure_user_exists(db: Session, user_id: int, username: str | None = None) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    has_changes = False

    if not user:
        user = User(id=user_id, username=username or f"user{user_id}")
        db.add(user)
        db.flush()
        has_changes = True

    if not user.preferences:
        user.preferences = UserPreference(
            language=LanguageCode.UK,
            theme_mode=ThemeMode.SYSTEM,
        )
        db.add(user.preferences)
        has_changes = True

    if has_changes:
        db.commit()
        db.refresh(user)

    return user


def ensure_demo_user(db: Session) -> User:
    return ensure_user_exists(db, 1, username="demo")
