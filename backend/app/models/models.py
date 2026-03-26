from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.time import utcnow_naive


class DayStatus(StrEnum):
    WORKED = "worked"
    VACATION = "vacation"
    DAY_OFF = "day_off"
    SICK_LEAVE = "sick_leave"
    CUSTOM = "custom"


class ThemeMode(StrEnum):
    LIGHT = "light"
    DARK = "dark"
    SYSTEM = "system"
    CUSTOM = "custom"


class LanguageCode(StrEnum):
    UK = "uk"
    EN = "en"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow_naive)

    sessions: Mapped[list["WorkSession"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    day_entries: Mapped[list["DayEntry"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    preferences: Mapped["UserPreference | None"] = relationship(
        back_populates="user", cascade="all, delete-orphan", uselist=False
    )


class WorkSession(Base):
    __tablename__ = "work_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    start_time: Mapped[datetime] = mapped_column(DateTime, index=True)
    end_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow_naive)

    user: Mapped["User"] = relationship(back_populates="sessions")


class DayEntry(Base):
    __tablename__ = "day_entries"
    __table_args__ = (UniqueConstraint("user_id", "entry_date", name="uq_user_entry_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    entry_date: Mapped[date] = mapped_column(Date, index=True)

    computed_seconds: Mapped[int] = mapped_column(Integer, default=0)
    override_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[DayStatus] = mapped_column(Enum(DayStatus), default=DayStatus.WORKED)
    note: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow_naive, onupdate=utcnow_naive)

    user: Mapped["User"] = relationship(back_populates="day_entries")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, index=True)

    language: Mapped[LanguageCode] = mapped_column(Enum(LanguageCode), default=LanguageCode.UK)
    theme_mode: Mapped[ThemeMode] = mapped_column(Enum(ThemeMode), default=ThemeMode.SYSTEM)
    custom_primary: Mapped[str] = mapped_column(String(7), default="#6d5dfc")
    custom_background: Mapped[str] = mapped_column(String(7), default="#111827")
    custom_surface: Mapped[str] = mapped_column(String(7), default="#1f2937")
    custom_text: Mapped[str] = mapped_column(String(7), default="#f9fafb")

    user: Mapped["User"] = relationship(back_populates="preferences")
