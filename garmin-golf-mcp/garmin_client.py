"""Garmin Connect client wrapper for golf data access."""

import json
import logging
from datetime import date, timedelta
from pathlib import Path

from garminconnect import Garmin

logger = logging.getLogger(__name__)

TOKEN_DIR = Path.home() / ".garminconnect"


class GarminGolfClient:
    """Wrapper around garminconnect for golf-specific data retrieval."""

    def __init__(self):
        self._client: Garmin | None = None

    @property
    def client(self) -> Garmin:
        if self._client is None:
            raise RuntimeError("Not logged in. Call login() first.")
        return self._client

    def login(self, email: str, password: str) -> str:
        """Authenticate with Garmin Connect. Caches tokens for reuse."""
        try:
            self._client = Garmin(email, password)
            self._client.login()
            self._client.garth.dump(str(TOKEN_DIR))
            return "Login successful."
        except Exception as e:
            logger.error("Login failed: %s", e)
            raise

    def login_with_token(self) -> str:
        """Resume session from cached tokens."""
        try:
            self._client = Garmin()
            self._client.login(str(TOKEN_DIR))
            return "Resumed session from cached tokens."
        except Exception:
            self._client = None
            raise RuntimeError(
                "No cached session found. Use login(email, password) first."
            )

    def get_golf_summary(self) -> dict:
        """Get golf scorecard summary."""
        return self.client.get_golf_summary()

    def get_golf_scorecard(self, scorecard_id: int) -> dict:
        """Get detailed scorecard by ID."""
        return self.client.get_golf_scorecard(scorecard_id)

    def get_activities(
        self, start: int = 0, limit: int = 20, activity_type: str = "golf"
    ) -> list[dict]:
        """Get golf activities from Garmin Connect."""
        activities = self.client.get_activities(start, limit)
        if activity_type:
            activities = [
                a
                for a in activities
                if activity_type.lower() in a.get("activityType", {}).get("typeKey", "").lower()
            ]
        return activities

    def get_activity_details(self, activity_id: int) -> dict:
        """Get full details for a specific activity."""
        return self.client.get_activity(activity_id)

    def get_recent_golf_sessions(self, days: int = 30) -> list[dict]:
        """Get golf sessions from the last N days."""
        end = date.today()
        start = end - timedelta(days=days)
        activities = self.client.get_activities_by_date(
            start.isoformat(), end.isoformat(), "golf"
        )
        return activities

    def get_activity_splits(self, activity_id: int) -> dict:
        """Get activity split data (may contain per-club or per-hole info)."""
        return self.client.get_activity_splits(activity_id)

    def get_activity_details_json(self, activity_id: int) -> dict:
        """Get the full JSON detail payload for an activity."""
        return self.client.get_activity_details(activity_id)
