from __future__ import annotations

from typing import Literal

from pydantic import Field
from typing_extensions import Annotated

Status = Literal["worked", "vacation", "day_off", "sick_leave", "custom"]
Language = Literal["uk", "en"]
ThemeMode = Literal["light", "dark", "system", "custom"]
HexColor = Annotated[str, Field(pattern=r"^#[0-9A-Fa-f]{6}$")]
