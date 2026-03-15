from __future__ import annotations

from datetime import UTC, datetime


def utcnow_naive() -> datetime:
    # Keep DB datetimes naive UTC for SQLite compatibility.
    return datetime.now(UTC).replace(tzinfo=None)
