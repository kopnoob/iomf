"""Golf coaching rules and advice in Norwegian.

Provides structured coaching data based on swing metrics analysis.
Code and comments in English, coaching output in Norwegian.
"""

# Coaching rules: condition -> (diagnosis, causes, drills)
# All text output in Norwegian for the end user.

COACHING_RULES: dict[str, dict] = {
    "high_spin_driver": {
        "condition": "Driver spin_rate > 3500 rpm",
        "diagnose": "For høy spin på driver",
        "årsaker": [
            "For bratt angrepsvinkel (angle of attack for negativ)",
            "Åpen kølleflate ved treff",
            "Treff for lavt på kølleflaten",
        ],
        "øvelser": [
            "Tee ballen høyere og plasser den lenger frem i stance",
            "Øv på å treffe ballen på vei opp (positiv angrepsvinkel)",
            "Spray kølleflaten med fotspray for å se treffsonen",
            "Fokuser på å 'sveipe' ballen av teen, ikke slå ned på den",
        ],
        "mål": "Reduser spin til 2200-2800 rpm for maksimal carry",
    },
    "low_smash_factor": {
        "condition": "Smash factor < 1.42",
        "diagnose": "Lav smash factor – ineffektivt energioverføring",
        "årsaker": [
            "Treff utenfor sweet spot (tå eller hæl)",
            "Dårlig timing i svingen",
            "Ustabil køllebane gjennom treffpunktet",
        ],
        "øvelser": [
            "Bruk impact tape eller fotspray for å finne treffsonen",
            "Sving med 80% kraft og fokuser på sentrum-treff",
            "Øv slow-motion svinger for å føle kølleflaten gjennom impact",
            "Halvsving-drill: 9-til-3 posisjon med fokus på kontakt",
        ],
        "mål": "Smash factor over 1.45 for driver (1.50 er PGA Tour snitt)",
    },
    "inconsistent_launch": {
        "condition": "Launch angle std_dev > 3°",
        "diagnose": "Inkonsistent launch-vinkel",
        "årsaker": [
            "Varierende ballposisjon i stance",
            "Ustabilt kroppssenter gjennom svingen",
            "Inkonsistent tilt i overkroppen ved treff",
        ],
        "øvelser": [
            "Bruk alignment sticks for konsistent oppsett",
            "Plasser et merke på matten for eksakt ballposisjon",
            "Øv med fokus på å holde hodet stille gjennom impact",
            "Pump-drill: Stopp i toppen, sjekk posisjon, fullfør",
        ],
        "mål": "Launch angle standardavvik under 2° for konsistens",
    },
    "slice_pattern": {
        "condition": "Launch direction > 5° høyre + spin axis > 5° (for høyrehendt)",
        "diagnose": "Slice-mønster – ballen kurver til høyre",
        "årsaker": [
            "Åpen kølleflate i forhold til svingbanen",
            "Utenfra-inn svingbane (over the top)",
            "Svak grep som tillater flaten å åpne seg",
        ],
        "øvelser": [
            "Forsterke grepet: vri venstre hånd mer mot høyre",
            "Headcover-drill: Legg headcover utenfor ballen, sving innenfra",
            "Øv lukkede slag: Sikt høyre, sving til venstre med lukket flate",
            "Trekk høyre fot 5cm tilbake for å oppmuntre innenfra-svingbane",
        ],
        "mål": "Reduser spin axis til ±3° for rettere ballbane",
    },
    "hook_pattern": {
        "condition": "Launch direction < -5° venstre + spin axis < -5°",
        "diagnose": "Hook-mønster – ballen kurver til venstre",
        "årsaker": [
            "For lukket kølleflate ved treff",
            "For sterk innenfra-ut svingbane",
            "Overaktive hender gjennom impact",
        ],
        "øvelser": [
            "Svekk grepet litt: vri venstre hånd mot venstre",
            "Fokuser på å rotere kroppen, ikke hendene, gjennom impact",
            "Sving med 75% kraft for å føle kontroll",
            "Split-grip drill for å forstå håndrotasjon",
        ],
        "mål": "Spin axis mellom -3° og +3°",
    },
    "low_club_speed": {
        "condition": "Club speed under forventet for nivå",
        "diagnose": "Lav køllehastighet",
        "årsaker": [
            "Begrenset hofterotasjon",
            "Manglende lag i nedsving",
            "For stram grep/armer som bremser svingen",
        ],
        "øvelser": [
            "Sving med steppet fot: Steg mot mål i nedsvingen",
            "Whoosh-drill: Sving kølla opp-ned, lytt etter 'whoosh' ved ballen",
            "Overspeed-trening: Sving med lettere kølle for fart",
            "Stretching: Fokus på hofter, skuldre og thorax-rotasjon",
        ],
        "mål": "Øk gradvis med 2-3 mph av gangen, behold kontroll",
    },
    "steep_angle_of_attack": {
        "condition": "Angle of attack < -5° med driver",
        "diagnose": "For bratt angrepsvinkel med driver",
        "årsaker": [
            "Ballen for langt bak i stance",
            "Vektforskyvning mot mål for tidlig",
            "Overkroppen lener mot mål ved treff",
        ],
        "øvelser": [
            "Plasser ballen ved venstre hæl for driver",
            "Føl at du lener deg vekk fra målet ved treff (spine tilt)",
            "Tee-drill: Sett en tee 10cm foran ballen, prøv å ikke treffe den",
            "Sving opp mot ballen: Tenk 'baseball-sving' nivå",
        ],
        "mål": "Angrepsvinkel mellom -1° og +3° for driver",
    },
    "gapping_too_large": {
        "condition": "Avstandsgap mellom naboøller > 20 yards",
        "diagnose": "For stort avstandsgap mellom køller",
        "årsaker": [
            "Inkonsistent svinglengde mellom køller",
            "Feil loft-oppsett eller slitte køller",
            "Manglende kølle i baggen (f.eks. hybrid)",
        ],
        "øvelser": [
            "Sjekk loft-vinkler hos en kølletilpasser",
            "Vurder å legge til en hybrid eller utility-kølle",
            "Øv 'knockdown'-slag med den lengre kølla for gap-kontroll",
        ],
        "mål": "10-15 yards mellom hver kølle for jevn dekning",
    },
    "gapping_too_small": {
        "condition": "Avstandsgap mellom nabokøller < 5 yards",
        "diagnose": "For lite avstandsgap – overlappende køller",
        "årsaker": [
            "Loftene er for like mellom to køller",
            "En kølle treffes dårlig konsistent",
            "Feil shaft-oppsett påvirker en kølle",
        ],
        "øvelser": [
            "Få loftene sjekket og justert hos en pro",
            "Vurder å bytte ut en av de overlappende køllene",
            "Jobb med den dårligste kølla isolert på rangen",
        ],
        "mål": "Minst 8-10 yards mellom hver kølle",
    },
}


def get_applicable_coaching(findings: list[dict], gaps: list[dict] | None = None) -> list[dict]:
    """Match analysis findings to coaching rules.

    Args:
        findings: Output from analysis.analyze_metrics()
        gaps: Output from analysis.gapping_analysis()

    Returns:
        List of applicable coaching advice dicts.
    """
    advice = []

    for f in findings:
        metric = f["metric"]
        value = f["value"]
        status = f["status"]
        club = f["club"]

        # High spin on driver
        if club == "Driver" and metric == "spin_rate" and value > 3500:
            advice.append(COACHING_RULES["high_spin_driver"])

        # Low smash factor
        if metric == "smash_factor" and value < 1.42:
            advice.append(COACHING_RULES["low_smash_factor"])

        # Steep angle of attack with driver
        if club == "Driver" and metric == "angle_of_attack" and value < -5:
            advice.append(COACHING_RULES["steep_angle_of_attack"])

        # Low club speed
        if metric == "club_head_speed" and status in ("low", "very_low"):
            advice.append(COACHING_RULES["low_club_speed"])

    # Check for slice/hook from launch direction and spin axis
    launch_dir = next(
        (f["value"] for f in findings if f["metric"] == "launch_direction"), None
    )
    spin_axis = next(
        (f["value"] for f in findings if f["metric"] == "spin_axis"), None
    )
    if launch_dir is not None and spin_axis is not None:
        if launch_dir > 5 and spin_axis > 5:
            advice.append(COACHING_RULES["slice_pattern"])
        elif launch_dir < -5 and spin_axis < -5:
            advice.append(COACHING_RULES["hook_pattern"])

    # Check consistency (if std_dev data present)
    launch_std = next(
        (f.get("std_dev") for f in findings if f["metric"] == "launch_angle"), None
    )
    if launch_std is not None and launch_std > 3:
        advice.append(COACHING_RULES["inconsistent_launch"])

    # Gapping issues
    if gaps:
        for g in gaps:
            if g["issue"] == "for_stor_gap":
                advice.append(COACHING_RULES["gapping_too_large"])
            elif g["issue"] == "for_liten_gap":
                advice.append(COACHING_RULES["gapping_too_small"])

    # Deduplicate by diagnosis
    seen = set()
    unique_advice = []
    for a in advice:
        if a["diagnose"] not in seen:
            seen.add(a["diagnose"])
            unique_advice.append(a)

    return unique_advice


def format_coaching_report(advice_list: list[dict]) -> str:
    """Format coaching advice into a readable Norwegian report."""
    if not advice_list:
        return "Ingen spesifikke forbedringsområder identifisert. Fortsett å trene!"

    lines = ["# Coaching-rapport\n"]

    for i, advice in enumerate(advice_list, 1):
        lines.append(f"## {i}. {advice['diagnose']}")
        lines.append("")

        lines.append("**Mulige årsaker:**")
        for cause in advice["årsaker"]:
            lines.append(f"- {cause}")
        lines.append("")

        lines.append("**Øvelser og tips:**")
        for drill in advice["øvelser"]:
            lines.append(f"- {drill}")
        lines.append("")

        lines.append(f"**Mål:** {advice['mål']}")
        lines.append("")

    return "\n".join(lines)
