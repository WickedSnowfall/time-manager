from __future__ import annotations

from pydantic import BaseModel, Field, model_validator

from .common import Status


class EntryItem(BaseModel):
    id: int
    day: str
    display_date: str
    hours: str
    total_seconds: int
    status: Status
    note: str = ""


class EntriesResponse(BaseModel):
    items: list[EntryItem]
    summary_seconds: int
    summary_label: str


class UpdateEntryRequest(BaseModel):
    override_seconds: int | None = Field(default=None, ge=0)
    is_override: bool = True
    status: Status
    note: str = Field(default="", max_length=500)

    @model_validator(mode="after")
    def validate_override_seconds(self) -> "UpdateEntryRequest":
        if self.is_override and self.override_seconds is None:
            raise ValueError("override_seconds is required when is_override is true")
        return self
