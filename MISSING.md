# Missing MCP servers — research log

Living list of MCP servers that do **not** exist yet (verified against the MCP
registry, npm, GitHub and the web), plus what was checked and skipped and why.

Updated: 2026-09-22. Repo count at time of writing: 706.

## Verified missing — build next

| Server | API | Auth | Evidence |
|---|---|---|---|
| `weatherbit-mcp` | api.weatherbit.io/v2.0 (current, forecast, alerts, air quality) | free-tier key, 403 live | registry 0 hits, npm FREE |
| `marketstack-mcp` | api.marketstack.com/v1 (EOD prices, tickers, exchanges) | free-tier key, 401 live | registry 0 hits, npm FREE |
| `kucoin-mcp` | api.kucoin.com (orderbook, prices, symbols, stats, klines) | keyless public market data | registry 0 hits; sibling exchanges all covered locally |
| `bitwarden-mcp` | Bitwarden public REST API / CLI (vault, ciphers, folders) | self-hosted or cloud API key | registry 0 hits |
| `suunto-mcp` | Suunto partner API (workouts, activity) | free dev app | registry 0 hits |
| `netatmo-mcp` | Netatmo/LeGrand API (weather stations, thermostat, cameras) | free dev app | registry 0 hits |
| `switchbot-mcp` | SwitchBot API v1.1 (devices, status, control) | free token | registry 0 hits |
| `doppler-mcp` | Doppler secrets API (configs, secrets, activity) | free key | registry 0 hits |
| `infisical-mcp` | Infisical API (secrets, folders, machine identities) | free cloud / self-host | registry 0 hits |
| `youtrack-mcp` | YouTrack REST API (issues, projects, agile boards) | instance token | registry 0 hits |

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
- PM/work: Linear (official), Notion, Jira, Confluence, Airtable (official), Asana, ClickUp, Monday (official), Smartsheet
- Fitness: Garmin, Whoop, Oura, Withings, Polar
- Smart home: Home Assistant (official), Shelly, Govee
- Analytics/flags: PostHog (official), Mixpanel (local), Amplitude (official), Matomo, GrowthBook (official)
- Uptime: UptimeRobot (official), Better Stack
- Incidents: PagerDuty (official)

## Dropped — no usable public API or dead endpoints

- Underdog Fantasy / PrizePicks — no public API
- Drift Protocol — api.drift.trade unreachable, no documented public REST
- SMHI — metfcst point endpoint 404s (API shape changed, needs re-research)
- Hellomoon — rest.hellomoon.io unreachable
- Kagi — API requires a paid plan

## To research (untouched territory)

- **Secrets leftovers**: 1Password Connect, HashiCorp Vault
- **Incidents leftovers**: Incident.io, Rootly, FireHydrant, Squadcast
- **Analytics leftovers**: Plausible, Umami, Unleash, Flagsmith, LaunchDarkly, Statsig, Checkly, Honeybadger
- **Smart home leftovers**: Tuya, Tado, Homey, Philips Hue
- **Transit leftovers**: Auckland Transport, PTV Victoria, SL Stockholm, NS Netherlands, ÖBB, Deutsche Bahn, Amtrak, VIA Rail, Indian Railways
- **Weather leftovers**: FMI Finland, KNMI Netherlands, DMI Denmark, Meteo France
- **Dev extras**: Shortcut, Redmine, Bugzilla
