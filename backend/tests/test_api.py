from __future__ import annotations

import unittest

from fastapi.testclient import TestClient

from app.main import app
from app.db import Base, SessionLocal, engine
from app.services import ensure_demo_user


class ApiFlowTestCase(unittest.TestCase):
    def setUp(self) -> None:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            ensure_demo_user(db)
        self.client_cm = TestClient(app)
        self.client = self.client_cm.__enter__()

    def tearDown(self) -> None:
        self.client_cm.__exit__(None, None, None)

    def test_session_entry_and_preferences_flow(self) -> None:
        active = self.client.get("/api/sessions/active")
        self.assertEqual(active.status_code, 200)
        self.assertFalse(active.json()["active"])

        started = self.client.post("/api/sessions/start")
        self.assertEqual(started.status_code, 200)
        self.assertEqual(started.json()["status"], "started")

        stopped = self.client.post("/api/sessions/stop")
        self.assertEqual(stopped.status_code, 200)
        self.assertEqual(stopped.json()["status"], "stopped")

        entries = self.client.get("/api/entries?months=1")
        self.assertEqual(entries.status_code, 200)
        items = entries.json()["items"]
        self.assertEqual(len(items), 1)

        entry_id = items[0]["id"]
        updated_entry = self.client.patch(
            f"/api/entries/{entry_id}",
            json={
                "override_seconds": 5400,
                "is_override": True,
                "status": "vacation",
                "note": "planned leave",
            },
        )
        self.assertEqual(updated_entry.status_code, 200)
        self.assertEqual(updated_entry.json()["hours"], "01:30")
        self.assertEqual(updated_entry.json()["status"], "vacation")

        updated_prefs = self.client.put(
            "/api/preferences",
            json={
                "language": "en",
                "theme_mode": "custom",
                "primary_color": "#112233",
                "background_color": "#223344",
                "surface_color": "#334455",
                "text_color": "#fefefe",
            },
        )
        self.assertEqual(updated_prefs.status_code, 200)
        self.assertEqual(updated_prefs.json()["language"], "en")


if __name__ == "__main__":
    unittest.main()
