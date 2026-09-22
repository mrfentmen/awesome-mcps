# Missing MCP servers — research log

Living list of MCP servers that do **not** exist yet (verified against the MCP
registry, npm, GitHub and the web), plus what was checked and skipped and why.

Updated: 2026-09-22. Repo count at time of writing: 706.

## Verified missing — build next

(none pending — all 10 below built 2026-09-22: `weatherbit-mcp`, `marketstack-mcp`,
`kucoin-mcp`, `bitwarden-mcp`, `suunto-mcp`, `netatmo-mcp`, `switchbot-mcp`,
`doppler-mcp`, `infisical-mcp`, `youtrack-mcp`. Scoped on npm: bitwarden, suunto,
youtrack — plain names were taken. Plus built 2026-09-23: `ns-mcp` (NS Dutch
Railways, Ocp-Apim key), `knmi-mcp` (KNMI open data, raw-key auth).)

## Skipped — already a thing

Do not build; covered by others or by this repo.

- itch.io — z27fang/itch-io-mcp-ts, itch-community, Vinkius, Apify
- Epic Games Store — pixfishx / meethuhu epic-free-games
- Pirate Weather — pipeworx-io/mcp-pirate-weather
- Tomorrow.io — pipeworx-io/tomorrow-io
- TfNSW — piddlingtuna alerts, danhussey stops/departures, maxim75 trip planner
- HSL Helsinki — devusvulgaris/mcp-hsl (also on npm)
- Xbox — 312-dev/xbox-mcp via OpenXBL
- Raydium — official docs MCP (docs.raydium.io/mcp), kukapay launchlab tools
- Sorare — AnythingMCP 18-tool adapter (bcrypt auth, needs user account)
- Shyft — covered by Shyft's own MCP directory
- Telegram, Strava, Fitbit, Last.fm, OpenLibrary, Brave, Neon (official), ClickHouse (official), Home Assistant (official ha-mcp), Metaplex, SNCF, Stocktwits, Sleeper, OpenWeatherMap (official), Eurostat, StatCan, AccuWeather, AEMET, EODHD — all have registry servers
- bible — this repo (`bible-mcp`) + vineverse, midvash and others
- torah — this repo (`torah-mcp`); JonathanB555/torah-mcp also exists
- Exchanges: Binance, Bybit (mcp-dir/bybit-mcp), and all local ones (coinbase, kraken, okx, bitstamp, gemini, bitfinex, mexc, gateio, bitget, upbit, bithumb, deribit)
- PM/work: Linear (official), Notion, Jira, Confluence, Airtable (official), Asana, ClickUp, Monday (official), Smartsheet, Coda (official + community), Redmine, Shortcut, Bugzilla (kud, 12 tools)
- Fitness: Garmin, Whoop, Oura, Withings, Polar
- Smart home: Home Assistant (official), Shelly, Govee, Tuya (official platform + PyPI), Homey Pro (60 tools)
- Analytics/flags: PostHog (official), Mixpanel (local), Amplitude (official), Matomo, GrowthBook (official), Plausible, Umami, Unleash (official), Flagsmith (official), LaunchDarkly, Statsig (official), Checkly, Honeybadger (official)
- Uptime: UptimeRobot (official), Better Stack
- Incidents: PagerDuty (official), incident.io (official remote MCP), FireHydrant (official), Squadcast, Rootly
- Secrets: 1Password, Vault (official)
- Rail/transit: Deutsche Bahn (3x community), ÖBB, Amtrak (pipeworx), TfNSW (3x), HSL (devusvulgaris), PTV (malamutemayhem), NS (this repo)
- Weather: FMI (pipeworx), AEMET, Met Office (this repo)

## Dropped — no usable public API or dead endpoints

- Underdog Fantasy / PrizePicks — no public API
- Drift Protocol — api.drift.trade unreachable, no documented public REST
- SMHI — metfcst point endpoint 404s (API shape changed, needs re-research)
- Hellomoon — rest.hellomoon.io unreachable
- Kagi — API requires a paid plan
- Auckland Transport — api.at.govt.nz routes unverifiable from here (portal docs are JS-driven, no swagger found)
- Trafiklab/SL — api.sl.se + dev.trafiklab.se unreachable from here
- DMI Denmark — dmigw.govcloud.dk + api.dmi.dk unreachable from here
- Météo-France — public API base unverified (404)
- Tado / Hue / VIA Rail / Indian Railways / DSB — unofficial, pairing-gated, or no public API

## To research (untouched territory)

- **Secrets leftovers**: (none — Vault/1Password/Bitwarden/Doppler/Infisical all covered)
- **Incidents leftovers**: (none — all covered)
- **Transit leftovers**: VIA Rail, Indian Railways (no public API found yet — recheck)
- **Weather leftovers**: (none — all covered or dropped)
- **Dev extras**: (none — all covered)
