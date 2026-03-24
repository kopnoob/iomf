# Garmin Golf Coach MCP Server

MCP-server som kobler Claude til dine Garmin Approach R50 golfdata for personlig swingrådgivning.

## Funksjoner

- **Hent golfdata** fra Garmin Connect (treningsøkter, scorecards)
- **Analyser svingmetrikker** mot referanseverdier for ditt nivå
- **Få coaching-råd** på norsk med konkrete øvelser og drills
- **Gapping-analyse** for å finne hull i kølledekningen

## Installasjon

```bash
cd garmin-golf-mcp
pip install -e .
```

## Oppsett med Claude Code

Legg til i `.claude/settings.json`:

```json
{
  "mcpServers": {
    "garmin-golf": {
      "command": "python",
      "args": ["/full/path/to/garmin-golf-mcp/server.py"]
    }
  }
}
```

## Bruk

Etter oppsett kan du snakke med Claude og si:

- "Logg inn på Garmin Connect" (krever brukernavn/passord første gang)
- "Hent mine siste golftreninger"
- "Analyser min driver: klubbhastighet 95 mph, ballhastighet 140 mph, spin 3200 rpm"
- "Gi meg tips for å redusere spin på driver"
- "Sjekk gapping mellom køllene mine"

## Tilgjengelige MCP-verktøy

| Verktøy | Beskrivelse |
|---------|-------------|
| `garmin_login` | Logg inn på Garmin Connect |
| `garmin_resume_session` | Gjenoppta forrige sesjon |
| `get_golf_sessions` | List golføkter fra siste N dager |
| `get_session_details` | Detaljerte metrikker for en økt |
| `get_golf_scorecard` | Hent scorecard-data |
| `get_club_averages` | Gjennomsnitt per kølle i en økt |
| `analyze_swing` | Analyser sving mot referanseverdier |
| `get_coaching_advice` | Personlige coaching-råd på norsk |
| `get_swing_benchmarks` | Vis referanseverdier for en kølle |
| `analyze_gapping` | Analyser avstandsgap mellom køller |

## Metrikker fra R50

Approach R50 måler følgende:

**Ball:** Ball Speed, Launch Angle, Launch Direction, Spin Rate, Spin Axis, Carry Distance, Total Distance, Deviation, Apex Height

**Kølle:** Club Head Speed, Club Face Angle, Angle of Attack, Smash Factor

## Merknader

- Garmin Connect har ingen offisiell forbruker-API for golfdata. Denne serveren bruker `python-garminconnect` som kan bryte ved Garmin-oppdateringer.
- Tokens caches i `~/.garminconnect/` slik at du ikke trenger å logge inn hver gang.
- Simulator-økter fra R50 lagres som aktiviteter i Garmin Connect etter Wi-Fi-sync.
