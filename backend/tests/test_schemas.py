from __future__ import annotations

import unittest

from pydantic import ValidationError

from app.schemas import PreferencesUpdateRequest, UpdateEntryRequest


class SchemasTestCase(unittest.TestCase):
    def test_update_entry_requires_override_seconds_for_override_mode(self) -> None:
        with self.assertRaises(ValidationError):
            UpdateEntryRequest(
                override_seconds=None,
                is_override=True,
                status="worked",
                note="",
            )

    def test_update_entry_allows_none_override_when_disabled(self) -> None:
        payload = UpdateEntryRequest(
            override_seconds=None,
            is_override=False,
            status="vacation",
            note="manual",
        )

        self.assertIsNone(payload.override_seconds)
        self.assertFalse(payload.is_override)

    def test_preferences_require_valid_hex_colors(self) -> None:
        with self.assertRaises(ValidationError):
            PreferencesUpdateRequest(
                language="uk",
                theme_mode="custom",
                primary_color="red",
                background_color="#000000",
                surface_color="#111111",
                text_color="#ffffff",
            )


if __name__ == "__main__":
    unittest.main()
