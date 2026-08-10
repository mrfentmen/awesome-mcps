# Formula 1 MCP

Formula 1 race results, driver standings, and season schedules from the public Ergast mirror. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `last_race`  Most recent race results.
* `driver_standings`  Current driver standings.
* `season_schedule`  Race schedule for a season.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public jolpi.ca Ergast mirror.
