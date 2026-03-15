from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_active_user_id
from app.schemas import EntriesResponse, EntryItem, UpdateEntryRequest
from app.services.entries_service import get_entries_response, update_entry_for_user

router = APIRouter(prefix="/api/entries", tags=["entries"])


@router.get("", response_model=EntriesResponse)
def list_entries(
    months: int = Query(default=1, ge=1, le=6),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_active_user_id),
) -> EntriesResponse:
    return get_entries_response(db, user_id, months)


@router.patch("/{entry_id}", response_model=EntryItem)
def update_entry(
    entry_id: int,
    payload: UpdateEntryRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_active_user_id),
) -> EntryItem:
    updated = update_entry_for_user(db, user_id, entry_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Entry not found")
    return updated
