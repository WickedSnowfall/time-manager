from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models import DayEntry, DayStatus
from app.schemas import EntriesResponse, EntryItem, UpdateEntryRequest
from app.services.time_helpers import format_hhmm, format_summary


def final_seconds(entry: DayEntry) -> int:
    return entry.override_seconds if entry.override_seconds is not None else entry.computed_seconds


def to_entry_item(entry: DayEntry) -> EntryItem:
    total = final_seconds(entry)
    return EntryItem(
        id=entry.id,
        day=entry.entry_date.isoformat(),
        display_date=entry.entry_date.strftime("%d/%m"),
        hours=format_hhmm(total),
        total_seconds=total,
        status=entry.status.value,
        note=entry.note,
    )


def get_entries_response(db: Session, user_id: int, months: int) -> EntriesResponse:
    cutoff = date.today() - timedelta(days=31 * months)
    entries = (
        db.query(DayEntry)
        .filter(DayEntry.user_id == user_id, DayEntry.entry_date >= cutoff)
        .order_by(DayEntry.entry_date.desc())
        .all()
    )

    items = [to_entry_item(entry) for entry in entries]
    summary_seconds = sum(item.total_seconds for item in items)
    return EntriesResponse(
        items=items,
        summary_seconds=summary_seconds,
        summary_label=format_summary(summary_seconds),
    )


def update_entry_for_user(
    db: Session,
    user_id: int,
    entry_id: int,
    payload: UpdateEntryRequest,
) -> EntryItem | None:
    entry = db.query(DayEntry).filter(DayEntry.id == entry_id, DayEntry.user_id == user_id).first()
    if not entry:
        return None

    entry.override_seconds = payload.override_seconds if payload.is_override else None
    entry.status = DayStatus(payload.status)
    entry.note = payload.note

    db.commit()
    db.refresh(entry)
    return to_entry_item(entry)
