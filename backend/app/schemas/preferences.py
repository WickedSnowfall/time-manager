from __future__ import annotations

from pydantic import BaseModel

from .common import HexColor, Language, ThemeMode


class PreferencesBase(BaseModel):
    language: Language
    theme_mode: ThemeMode
    primary_color: HexColor
    background_color: HexColor
    surface_color: HexColor
    text_color: HexColor


class PreferencesResponse(PreferencesBase):
    pass


class PreferencesUpdateRequest(PreferencesBase):
    pass
