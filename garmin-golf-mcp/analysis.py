"""Swing analysis with reference benchmarks for all club types."""

from dataclasses import dataclass

# Reference benchmarks: (min, ideal_low, ideal_high, max) per skill level
# Sources: TrackMan, Arccos, PGA Tour averages adapted for amateurs
# Units: speed=mph, angle=degrees, spin=rpm, distance=yards

SKILL_LEVELS = ("beginner", "intermediate", "advanced")


@dataclass
class ClubBenchmark:
    """Benchmark ranges for a specific club and metric."""

    club: str
    metric: str
    unit: str
    beginner: tuple[float, float]
    intermediate: tuple[float, float]
    advanced: tuple[float, float]

    def range_for_level(self, level: str) -> tuple[float, float]:
        return getattr(self, level)


# fmt: off
BENCHMARKS: list[ClubBenchmark] = [
    # Driver
    ClubBenchmark("Driver", "club_head_speed", "mph",  (80, 93),   (93, 105),  (105, 118)),
    ClubBenchmark("Driver", "ball_speed",      "mph",  (120, 140), (140, 160), (160, 177)),
    ClubBenchmark("Driver", "smash_factor",    "",     (1.35, 1.42), (1.42, 1.48), (1.48, 1.51)),
    ClubBenchmark("Driver", "launch_angle",    "°",    (9, 16),    (10, 14),   (10, 13)),
    ClubBenchmark("Driver", "spin_rate",       "rpm",  (3000, 5000), (2200, 3500), (1800, 2800)),
    ClubBenchmark("Driver", "carry_distance",  "yds",  (170, 210), (210, 250), (250, 290)),

    # 3-Wood
    ClubBenchmark("3-Wood", "club_head_speed", "mph",  (75, 88),   (88, 100),  (100, 110)),
    ClubBenchmark("3-Wood", "ball_speed",      "mph",  (110, 130), (130, 150), (150, 165)),
    ClubBenchmark("3-Wood", "launch_angle",    "°",    (10, 16),   (10, 14),   (9, 13)),
    ClubBenchmark("3-Wood", "spin_rate",       "rpm",  (3500, 5500), (3000, 4500), (2500, 3800)),
    ClubBenchmark("3-Wood", "carry_distance",  "yds",  (150, 190), (190, 230), (230, 260)),

    # 5-Iron
    ClubBenchmark("5-Iron", "club_head_speed", "mph",  (70, 82),   (82, 93),   (93, 103)),
    ClubBenchmark("5-Iron", "ball_speed",      "mph",  (95, 115),  (115, 135), (135, 150)),
    ClubBenchmark("5-Iron", "launch_angle",    "°",    (12, 18),   (11, 16),   (10, 15)),
    ClubBenchmark("5-Iron", "spin_rate",       "rpm",  (4500, 6500), (4000, 5500), (4000, 5200)),
    ClubBenchmark("5-Iron", "carry_distance",  "yds",  (130, 160), (160, 185), (185, 210)),

    # 7-Iron
    ClubBenchmark("7-Iron", "club_head_speed", "mph",  (65, 78),   (78, 90),   (90, 98)),
    ClubBenchmark("7-Iron", "ball_speed",      "mph",  (85, 105),  (105, 125), (125, 140)),
    ClubBenchmark("7-Iron", "launch_angle",    "°",    (14, 22),   (14, 20),   (14, 18)),
    ClubBenchmark("7-Iron", "spin_rate",       "rpm",  (5500, 7500), (5500, 7000), (5800, 7200)),
    ClubBenchmark("7-Iron", "carry_distance",  "yds",  (110, 140), (140, 165), (165, 185)),

    # 9-Iron
    ClubBenchmark("9-Iron", "club_head_speed", "mph",  (60, 73),   (73, 85),   (85, 93)),
    ClubBenchmark("9-Iron", "ball_speed",      "mph",  (75, 95),   (95, 112), (112, 125)),
    ClubBenchmark("9-Iron", "launch_angle",    "°",    (20, 28),   (20, 27),   (20, 25)),
    ClubBenchmark("9-Iron", "spin_rate",       "rpm",  (7000, 9500), (7500, 9000), (8000, 9200)),
    ClubBenchmark("9-Iron", "carry_distance",  "yds",  (85, 115),  (115, 140), (140, 155)),

    # Pitching Wedge
    ClubBenchmark("PW", "club_head_speed", "mph",  (58, 70),   (70, 83),   (83, 90)),
    ClubBenchmark("PW", "ball_speed",      "mph",  (70, 88),   (88, 105),  (105, 118)),
    ClubBenchmark("PW", "launch_angle",    "°",    (24, 32),   (24, 30),   (24, 28)),
    ClubBenchmark("PW", "spin_rate",       "rpm",  (8000, 10500), (8500, 10500), (9000, 10500)),
    ClubBenchmark("PW", "carry_distance",  "yds",  (75, 105),  (105, 125), (125, 140)),

    # Sand Wedge
    ClubBenchmark("SW", "club_head_speed", "mph",  (55, 67),   (67, 78),   (78, 85)),
    ClubBenchmark("SW", "ball_speed",      "mph",  (60, 78),   (78, 92),   (92, 102)),
    ClubBenchmark("SW", "launch_angle",    "°",    (28, 36),   (28, 34),   (28, 32)),
    ClubBenchmark("SW", "spin_rate",       "rpm",  (8500, 11000), (9000, 11500), (9500, 11500)),
    ClubBenchmark("SW", "carry_distance",  "yds",  (55, 80),   (80, 100),  (100, 115)),
]
# fmt: on


def get_benchmarks_for_club(club: str) -> list[ClubBenchmark]:
    """Get all benchmarks for a specific club."""
    club_lower = club.lower().replace("-", "").replace(" ", "")
    return [
        b
        for b in BENCHMARKS
        if b.club.lower().replace("-", "").replace(" ", "") == club_lower
    ]


def classify_skill_level(club: str, metric: str, value: float) -> str:
    """Classify a single metric value into a skill level."""
    for b in BENCHMARKS:
        if b.club.lower() == club.lower() and b.metric == metric:
            if b.advanced[0] <= value <= b.advanced[1]:
                return "advanced"
            if b.intermediate[0] <= value <= b.intermediate[1]:
                return "intermediate"
            return "beginner"
    return "unknown"


def analyze_metrics(club: str, metrics: dict[str, float]) -> list[dict]:
    """Analyze a set of metrics for a club against benchmarks.

    Returns a list of findings with rating and recommendation.
    """
    findings = []
    benchmarks = get_benchmarks_for_club(club)

    for b in benchmarks:
        value = metrics.get(b.metric)
        if value is None:
            continue

        level = classify_skill_level(b.club, b.metric, value)
        low, high = b.intermediate  # Use intermediate as "target"

        status = "ok"
        if value < b.beginner[0]:
            status = "very_low"
        elif value < low:
            status = "low"
        elif value > b.advanced[1]:
            status = "very_high"
        elif value > high and b.metric == "spin_rate":
            status = "high"

        findings.append(
            {
                "club": b.club,
                "metric": b.metric,
                "value": value,
                "unit": b.unit,
                "level": level,
                "status": status,
                "target_range": f"{low}-{high} {b.unit}",
            }
        )

    return findings


def calculate_consistency(shots: list[dict], metric: str) -> dict:
    """Calculate mean and standard deviation for a metric across shots."""
    values = [s[metric] for s in shots if metric in s and s[metric] is not None]
    if not values:
        return {"metric": metric, "count": 0}

    n = len(values)
    mean = sum(values) / n
    variance = sum((v - mean) ** 2 for v in values) / n if n > 1 else 0
    std_dev = variance**0.5

    return {
        "metric": metric,
        "count": n,
        "mean": round(mean, 2),
        "std_dev": round(std_dev, 2),
        "min": round(min(values), 2),
        "max": round(max(values), 2),
        "consistency_pct": round((1 - std_dev / mean) * 100, 1) if mean else 0,
    }


def gapping_analysis(club_averages: dict[str, dict]) -> list[dict]:
    """Analyze distance gaps between clubs.

    club_averages: {club_name: {carry_distance: float, ...}}
    Returns list of gap issues.
    """
    # Expected club order from longest to shortest
    club_order = [
        "Driver", "3-Wood", "5-Wood", "Hybrid", "4-Iron", "5-Iron",
        "6-Iron", "7-Iron", "8-Iron", "9-Iron", "PW", "GW", "SW", "LW",
    ]

    sorted_clubs = []
    for club in club_order:
        if club in club_averages and "carry_distance" in club_averages[club]:
            sorted_clubs.append(
                (club, club_averages[club]["carry_distance"])
            )

    gaps = []
    ideal_gap = (10, 15)  # yards between clubs

    for i in range(len(sorted_clubs) - 1):
        club1, dist1 = sorted_clubs[i]
        club2, dist2 = sorted_clubs[i + 1]
        gap = dist1 - dist2

        issue = None
        if gap < 5:
            issue = "for_liten_gap"
        elif gap > 20:
            issue = "for_stor_gap"

        gaps.append(
            {
                "club_long": club1,
                "club_short": club2,
                "distance_long": round(dist1, 1),
                "distance_short": round(dist2, 1),
                "gap_yards": round(gap, 1),
                "ideal_gap": f"{ideal_gap[0]}-{ideal_gap[1]} yds",
                "issue": issue,
            }
        )

    return gaps
