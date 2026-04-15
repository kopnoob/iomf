"""MCP server for Garmin Approach R50 golf coaching.

Provides tools for Claude to fetch golf data from Garmin Connect,
analyze swing metrics, and deliver coaching advice in Norwegian.
"""

import json
import logging
from typing import Any

from mcp.server.fastmcp import FastMCP

from garmin_client import GarminGolfClient
from analysis import (
    analyze_metrics,
    calculate_consistency,
    gapping_analysis,
    get_benchmarks_for_club,
    BENCHMARKS,
)
from coaching import get_applicable_coaching, format_coaching_report

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

mcp = FastMCP("Garmin Golf Coach")

# Shared client instance
garmin = GarminGolfClient()


@mcp.tool()
def garmin_login(email: str, password: str) -> str:
    """Log in to Garmin Connect to access golf data.

    Args:
        email: Garmin Connect email address
        password: Garmin Connect password
    """
    try:
        return garmin.login(email, password)
    except Exception as e:
        return f"Login failed: {e}"


@mcp.tool()
def garmin_resume_session() -> str:
    """Resume a previous Garmin Connect session from cached tokens.
    Use this before login if the user has logged in before.
    """
    try:
        return garmin.login_with_token()
    except Exception as e:
        return f"Could not resume session: {e}. Use garmin_login instead."


@mcp.tool()
def get_golf_sessions(days: int = 90) -> str:
    """Get recent golf/simulator sessions from Garmin Connect.

    Args:
        days: Number of days to look back (default 90)

    Returns:
        JSON list of golf sessions with date, duration, and basic stats.
    """
    try:
        sessions = garmin.get_recent_golf_sessions(days)
        if not sessions:
            # Fall back to general activity search
            sessions = garmin.get_activities(start=0, limit=50, activity_type="golf")

        summary = []
        for s in sessions:
            summary.append(
                {
                    "activity_id": s.get("activityId"),
                    "name": s.get("activityName", "Golf"),
                    "date": s.get("startTimeLocal", ""),
                    "duration_min": round(s.get("duration", 0) / 60, 1),
                    "type": s.get("activityType", {}).get("typeKey", "unknown"),
                }
            )

        if not summary:
            return "Ingen golføkter funnet de siste {} dagene.".format(days)

        return json.dumps(summary, indent=2, ensure_ascii=False)
    except Exception as e:
        return f"Error fetching sessions: {e}"


@mcp.tool()
def get_session_details(activity_id: int) -> str:
    """Get detailed metrics for a specific golf/simulator session.

    Args:
        activity_id: The Garmin activity ID from get_golf_sessions
    """
    try:
        details = garmin.get_activity_details(activity_id)
        splits = garmin.get_activity_details_json(activity_id)

        result = {
            "activity_id": activity_id,
            "name": details.get("activityName", ""),
            "date": details.get("startTimeLocal", ""),
            "summary": {
                "duration_min": round(details.get("duration", 0) / 60, 1),
                "distance": details.get("distance"),
            },
            "metrics": details.get("summaryDTO", {}),
            "splits": splits if isinstance(splits, dict) else {},
        }

        return json.dumps(result, indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return f"Error fetching session details: {e}"


@mcp.tool()
def get_golf_scorecard(scorecard_id: int | None = None) -> str:
    """Get golf scorecard data. If no ID given, returns summary of all scorecards.

    Args:
        scorecard_id: Optional specific scorecard ID
    """
    try:
        if scorecard_id:
            card = garmin.get_golf_scorecard(scorecard_id)
            return json.dumps(card, indent=2, ensure_ascii=False, default=str)
        else:
            summary = garmin.get_golf_summary()
            return json.dumps(summary, indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return f"Error fetching scorecard: {e}"


@mcp.tool()
def get_club_averages(activity_id: int) -> str:
    """Extract per-club average metrics from a golf session.

    Parses the session data to find averages for each club used.

    Args:
        activity_id: The Garmin activity ID
    """
    try:
        details = garmin.get_activity_details_json(activity_id)

        # Try to extract club-level data from the activity details
        # The structure varies - we look for metrics arrays
        club_data = {}

        if isinstance(details, dict):
            # Look for metric descriptors and activity detail metrics
            metric_descriptors = details.get("metricDescriptors", [])
            activity_metrics = details.get("activityDetailMetrics", [])

            if metric_descriptors and activity_metrics:
                metric_names = [m.get("key", f"metric_{i}") for i, m in enumerate(metric_descriptors)]

                for entry in activity_metrics:
                    metrics_values = entry.get("metrics", [])
                    if metrics_values:
                        row = dict(zip(metric_names, metrics_values))
                        club_data[f"shot_{entry.get('metricsIndex', '?')}"] = row

        if not club_data:
            return json.dumps(
                {
                    "note": "Kunne ikke hente kølle-spesifikke data fra denne økten. "
                    "R50 simulator-data kan ha en annen struktur. "
                    "Prøv get_session_details for rå-data.",
                    "raw_keys": list(details.keys()) if isinstance(details, dict) else "not a dict",
                },
                indent=2,
                ensure_ascii=False,
            )

        return json.dumps(club_data, indent=2, ensure_ascii=False, default=str)
    except Exception as e:
        return f"Error extracting club averages: {e}"


@mcp.tool()
def analyze_swing(
    club: str,
    club_head_speed: float | None = None,
    ball_speed: float | None = None,
    launch_angle: float | None = None,
    spin_rate: float | None = None,
    carry_distance: float | None = None,
    smash_factor: float | None = None,
    angle_of_attack: float | None = None,
    club_face_angle: float | None = None,
    launch_direction: float | None = None,
    spin_axis: float | None = None,
) -> str:
    """Analyze swing metrics for a specific club against benchmarks.

    Enter the metrics you have - all are optional except club.
    Returns analysis with skill level classification and areas for improvement.

    Args:
        club: Club name (e.g., "Driver", "7-Iron", "PW", "SW")
        club_head_speed: Club head speed in mph
        ball_speed: Ball speed in mph
        launch_angle: Launch angle in degrees
        spin_rate: Spin rate in rpm
        carry_distance: Carry distance in yards
        smash_factor: Smash factor (ball_speed / club_head_speed)
        angle_of_attack: Angle of attack in degrees (negative = down)
        club_face_angle: Club face angle in degrees at impact
        launch_direction: Launch direction in degrees (+ = right)
        spin_axis: Spin axis in degrees (+ = right/slice)
    """
    metrics = {}
    for name, val in [
        ("club_head_speed", club_head_speed),
        ("ball_speed", ball_speed),
        ("launch_angle", launch_angle),
        ("spin_rate", spin_rate),
        ("carry_distance", carry_distance),
        ("smash_factor", smash_factor),
        ("angle_of_attack", angle_of_attack),
        ("club_face_angle", club_face_angle),
        ("launch_direction", launch_direction),
        ("spin_axis", spin_axis),
    ]:
        if val is not None:
            metrics[name] = val

    # Auto-calculate smash factor if possible
    if "smash_factor" not in metrics and "ball_speed" in metrics and "club_head_speed" in metrics:
        metrics["smash_factor"] = round(metrics["ball_speed"] / metrics["club_head_speed"], 3)

    findings = analyze_metrics(club, metrics)

    if not findings:
        available_clubs = sorted(set(b.club for b in BENCHMARKS))
        return (
            f"Ingen benchmarks funnet for '{club}'. "
            f"Tilgjengelige køller: {', '.join(available_clubs)}"
        )

    return json.dumps(
        {"club": club, "input_metrics": metrics, "analysis": findings},
        indent=2,
        ensure_ascii=False,
    )


@mcp.tool()
def get_coaching_advice(
    club: str,
    club_head_speed: float | None = None,
    ball_speed: float | None = None,
    launch_angle: float | None = None,
    spin_rate: float | None = None,
    carry_distance: float | None = None,
    smash_factor: float | None = None,
    angle_of_attack: float | None = None,
    launch_direction: float | None = None,
    spin_axis: float | None = None,
) -> str:
    """Get personalized coaching advice in Norwegian based on swing metrics.

    Analyzes your metrics and provides specific drills and tips.
    All advice is in Norwegian.

    Args:
        club: Club name (e.g., "Driver", "7-Iron", "PW")
        club_head_speed: Club head speed in mph
        ball_speed: Ball speed in mph
        launch_angle: Launch angle in degrees
        spin_rate: Spin rate in rpm
        carry_distance: Carry distance in yards
        smash_factor: Smash factor
        angle_of_attack: Angle of attack in degrees
        launch_direction: Launch direction in degrees (+ = right)
        spin_axis: Spin axis in degrees (+ = slice)
    """
    metrics = {}
    for name, val in [
        ("club_head_speed", club_head_speed),
        ("ball_speed", ball_speed),
        ("launch_angle", launch_angle),
        ("spin_rate", spin_rate),
        ("carry_distance", carry_distance),
        ("smash_factor", smash_factor),
        ("angle_of_attack", angle_of_attack),
        ("launch_direction", launch_direction),
        ("spin_axis", spin_axis),
    ]:
        if val is not None:
            metrics[name] = val

    if "smash_factor" not in metrics and "ball_speed" in metrics and "club_head_speed" in metrics:
        metrics["smash_factor"] = round(metrics["ball_speed"] / metrics["club_head_speed"], 3)

    findings = analyze_metrics(club, metrics)
    advice = get_applicable_coaching(findings)
    report = format_coaching_report(advice)

    return report


@mcp.tool()
def get_swing_benchmarks(club: str) -> str:
    """Get reference benchmarks for a specific club.

    Shows what beginner, intermediate, and advanced ranges look like
    for each metric.

    Args:
        club: Club name (e.g., "Driver", "7-Iron", "PW", "SW")
    """
    benchmarks = get_benchmarks_for_club(club)

    if not benchmarks:
        available_clubs = sorted(set(b.club for b in BENCHMARKS))
        return (
            f"Ingen benchmarks for '{club}'. "
            f"Tilgjengelige: {', '.join(available_clubs)}"
        )

    result = []
    for b in benchmarks:
        result.append(
            {
                "metric": b.metric,
                "unit": b.unit,
                "nybegynner": f"{b.beginner[0]}-{b.beginner[1]}",
                "middels": f"{b.intermediate[0]}-{b.intermediate[1]}",
                "avansert": f"{b.advanced[0]}-{b.advanced[1]}",
            }
        )

    return json.dumps(
        {"club": club, "benchmarks": result}, indent=2, ensure_ascii=False
    )


@mcp.tool()
def analyze_gapping(club_distances_json: str) -> str:
    """Analyze distance gaps between clubs to find coverage issues.

    Args:
        club_distances_json: JSON string like {"Driver": 240, "3-Wood": 220, "5-Iron": 185, "7-Iron": 160, "PW": 120}
            Values are carry distances in yards.
    """
    try:
        distances = json.loads(club_distances_json)
    except json.JSONDecodeError:
        return "Ugyldig JSON. Bruk format: {\"Driver\": 240, \"7-Iron\": 160, ...}"

    club_averages = {club: {"carry_distance": dist} for club, dist in distances.items()}
    gaps = gapping_analysis(club_averages)

    if not gaps:
        return "Trenger minst 2 køller for gapping-analyse."

    coaching = get_applicable_coaching([], gaps)

    return json.dumps(
        {"gaps": gaps, "coaching": [c["diagnose"] for c in coaching]},
        indent=2,
        ensure_ascii=False,
    )


if __name__ == "__main__":
    mcp.run()
