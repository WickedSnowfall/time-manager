from __future__ import annotations

import unittest
from datetime import date, datetime, timedelta

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.db import Base
from app.models import DayEntry, DayStatus, User, UserPreference, WorkSession
from app.schemas import PreferencesUpdateRequest
from app.services.day_entries import upsert_day_entry_from_sessions
from app.services.entries_service import get_entries_response
from app.services.preferences_service import get_or_create_preferences, update_preferences


class ServicesTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
        )
        testing_session_local = sessionmaker(
            bind=self.engine,
            autoflush=False,
            autocommit=False,
        )

        Base.metadata.create_all(bind=self.engine)
        self.db: Session = testing_session_local()

        user = User(id=1, username="demo")
        self.db.add(user)
        self.db.commit()

    def tearDown(self) -> None:
        self.db.close()
        self.engine.dispose()

    def test_upsert_day_entry_sums_multiple_sessions_and_preserves_override(self) -> None:
        target_day = date(2026, 3, 15)
        start = datetime.combine(target_day, datetime.min.time())

        self.db.add(
            DayEntry(
                user_id=1,
                entry_date=target_day,
                computed_seconds=0,
                override_seconds=3600,
                status=DayStatus.CUSTOM,
                note="manual",
            )
        )
        self.db.add_all(
            [
                WorkSession(
                    user_id=1,
                    start_time=start + timedelta(hours=9),
                    end_time=start + timedelta(hours=9, minutes=30),
                    duration_seconds=1800,
                ),
                WorkSession(
                    user_id=1,
                    start_time=start + timedelta(hours=10),
                    end_time=start + timedelta(hours=10, minutes=45),
                    duration_seconds=2700,
                ),
            ]
        )
        self.db.commit()

        entry = upsert_day_entry_from_sessions(self.db, 1, target_day)

        self.assertEqual(entry.computed_seconds, 4500)
        self.assertEqual(entry.override_seconds, 3600)
        self.assertEqual(entry.status, DayStatus.CUSTOM)
        self.assertEqual(entry.note, "manual")

    def test_get_entries_response_computes_summary_with_overrides(self) -> None:
        today = date.today()
        self.db.add_all(
            [
                DayEntry(
                    user_id=1,
                    entry_date=today,
                    computed_seconds=3600,
                    override_seconds=None,
                    status=DayStatus.WORKED,
                    note="",
                ),
                DayEntry(
                    user_id=1,
                    entry_date=today - timedelta(days=1),
                    computed_seconds=7200,
                    override_seconds=1800,
                    status=DayStatus.WORKED,
                    note="",
                ),
            ]
        )
        self.db.commit()

        response = get_entries_response(self.db, 1, months=1)

        self.assertEqual(len(response.items), 2)
        self.assertEqual(response.summary_seconds, 5400)
        self.assertEqual(response.summary_label, "1 h 30 m")

    def test_get_entries_response_shows_minimum_one_minute_for_short_session(self) -> None:
        today = date.today()
        self.db.add(
            DayEntry(
                user_id=1,
                entry_date=today,
                computed_seconds=2,
                override_seconds=None,
                status=DayStatus.WORKED,
                note="",
            )
        )
        self.db.commit()

        response = get_entries_response(self.db, 1, months=1)

        self.assertEqual(response.items[0].hours, "00:01")
        self.assertEqual(response.summary_label, "0 h 01 m")

    def test_preferences_create_and_update(self) -> None:
        prefs = get_or_create_preferences(self.db, user_id=1)
        self.assertIsInstance(prefs, UserPreference)

        payload = PreferencesUpdateRequest(
            language="en",
            theme_mode="custom",
            primary_color="#123456",
            background_color="#234567",
            surface_color="#345678",
            text_color="#ffffff",
        )

        updated = update_preferences(self.db, prefs, payload)

        self.assertEqual(updated.language.value, "en")
        self.assertEqual(updated.theme_mode.value, "custom")
        self.assertEqual(updated.custom_primary, "#123456")
        self.assertEqual(updated.custom_background, "#234567")
        self.assertEqual(updated.custom_surface, "#345678")
        self.assertEqual(updated.custom_text, "#ffffff")


if __name__ == "__main__":
    unittest.main()
