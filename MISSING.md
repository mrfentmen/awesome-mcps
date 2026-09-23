# Missing MCP servers — research log

Living list of MCP servers that do **not** exist yet (verified against the MCP
registry, npm, GitHub and the web), plus what was checked and skipped and why.

Updated: 2026-09-22. Repo count at time of writing: 706.

## Verified missing — build next

(none pending — all 10 below built 2026-09-22: `weatherbit-mcp`, `marketstack-mcp`,
`kucoin-mcp`, `bitwarden-mcp`, `suunto-mcp`, `netatmo-mcp`, `switchbot-mcp`,
`doppler-mcp`, `infisical-mcp`, `youtrack-mcp`. Scoped on npm: bitwarden, suunto,
youtrack — plain names were taken. Plus built 2026-09-23: `ns-mcp` (NS Dutch
Railways, Ocp-Apim key), `knmi-mcp` (KNMI open data, raw-key auth), `eccc-mcp`
(Canada GeoMet, keyless), `bom-mcp` (Australia BOM, keyless + geohash encoder),
`seoul-mcp` (Seoul air quality), `tdx-mcp` (Taiwan transport, OAuth). Plus built
2026-09-23: `mgm-mcp` (Turkey keyless + Origin header), `bmkg-mcp` (Indonesia
keyless), `kma-mcp` (Korea data.go.kr key), `bkk-mcp` (Budapest Futar key),
`chmi-mcp` (Czech open-data browser, keyless).)

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
- Rail/transit: Deutsche Bahn (3x community), ÖBB, Amtrak (pipeworx), TfNSW (3x), HSL (devusvulgaris), PTV (malamutemayhem), NS (this repo), SBB, GBFS (Gnist hosted), BKK (this repo)
- Weather: FMI (pipeworx), AEMET, Met Office (this repo), HKO (imjac0b + pongiotdevelop), JMA (pipeworx + sasonoda), NEA Singapore (vdineshk), IMGW (bartosz-kuc), KNMI (this repo), MGM (this repo), BMKG (this repo), KMA (this repo), CHMI (this repo), ECCC (this repo), BOM (this repo)
- Games/anime/comics: RAWG (pipeworx/Pipedream), IGDB (official + bielacki), GiantBomb (pipeworx), AniList (smithery), ComicVine (pipeworx), Jikan + MangaDex + OpenBrewery (this repo), Kitsu (official docs MCP + pipeworx)
- Books/music/podcasts: Google Books (pipeworx/Vinkius), Hardcover (3x), Listen Notes (pipeworx/Pipedream/Composio), AcoustID (Vinkius/cynosure), setlist.fm (chrischall/pipeworx), Bandsintown (pipeworx), TVMaze (cyanheads), CocktailDB (pipeworx)
- Energy: EIA (cyanheads + GSA-TTS + missionsquad)
- Space: Launch Library (official + pipeworx)

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
- Marvel API — RETIRED by Marvel, unusable
- JPL Horizons — ssd.jpl.nasa.gov unreachable from here (5 attempts; other .gov works, so likely bot-filtering)
- Copernicus (marine/climate) — guessed paths 404, needs account + docs
- Auckland Transport — api.at.govt.nz routes unverifiable from here (portal docs are JS-driven, no swagger found)

## To research (untouched territory)

- **Secrets leftovers**: (none — Vault/1Password/Bitwarden/Doppler/Infisical all covered)
- **Incidents leftovers**: (none — all covered)
- **Transit leftovers**: VIA Rail, Indian Railways (no public API found yet — recheck)
- **Weather leftovers**: (none — all covered or dropped)
- **Dev extras**: (none — all covered)

## Build backlog (fresh leads, free APIs known — verify then build)

Auth = free key unless noted keyless. Verify registry+npm+web before building.

- **Culture**: Europeana (free), DPLA (free), LoC loc.gov (keyless JSON), Internet Archive (keyless), Gallica BnF (?), DigitalNZ (?), Papers Past (?)
- **Health**: RxNorm NIH (keyless), CDC WONDER (?), WHO (?)
- **Education**: NCES (?), Coursera (?), edX (?), GreatSchools (?)
- **Patents**: WIPO PATENTSCOPE (free), J-PlatPat (free), KIPRIS (?), IP Australia AusPat (?), CIPO (?), EUIPO (free), Lens (?)
- **Standards**: IETF Datatracker (free), ETSI (?), W3C (keyless), OGC (?), FIDO (?), OpenID (?), HL7 FHIR test servers (keyless)
- **Oceans/earth**: OBIS (free), PSMSL sea level (free), IOOS glider DAC (free), Argo/Argovis (free), GEBCO (download), EMODnet (free), EMSC (covered via INGV server), GFZ (?), GeoNet NZ (pipeworx), FIRMS (covered), EONET NASA (free key), FIRMS taken
- **Biodiversity**: GBIF taken, iNaturalist taken, eBird taken — leftovers: Observation.org (?), Movebank (?), Motus (?)
- **Air**: OpenAQ taken, WAQI (local), DEFRA (unreachable — retry), RIVM (unreachable — retry), EEA (?), UBA (?), PurpleAir/IQAir (keys)
- **Outdoors**: Trailforks (free key), Hiking Project (free key), Outdooractive (free key), Komoot (OAuth — hard), AllTrails (no API)
- **Fuel**: Tankerkoenig taken, prix-carburants (Apify only — local build still open!), FuelWatch taken, Spritpreis AT (?), Spain datos.gob.es (?)
- **EV**: ABRP (has API), Tronity (?), evcc (?)
- **Space**: Space-Track taken (3x), JPL Horizons (unreachable — retry), SatNOGS (ours), CelesTrak (ours), N2YO (pipeworx), Launch Library taken
- **Registries**: Docker Hub (free public), RubyGems (free), Packagist (free), NuGet (free), Maven Central (free), Cargo (free), Hex (free), CRAN (?), MELPA (?), Chrome Web Store (?), Firefox Add-ons (?), Obsidian (?), Raycast (?)
- **Social/video**: YouTube (key), TikTok (approval), Rumble (?), Odysee (?), PeerTube per-instance (keyless), Tumblr taken, Flickr (local), 500px (?), DeviantArt (?), ArtStation (?), Behance (?), Dribbble (?), BeReal (?), Nextdoor (?), Slack (key), Signal (no), WhatsApp (no), Viber (?), Line (?), Kakao (?)
- **Music/audio**: Apple Music (key), Tidal (key), Qobuz (?), Napster (?), Pandora (?), SiriusXM (?), Libby (?), Hoopla (?), Kanopy (?), SomaFM (keyless), Radio Garden (no API), ISBNdb (free tier), Literal (free), Goodreads (dead)
- **Jobs**: Workable (key), SmartRecruiters (key), BambooHR (key), Personio (key), HiBob (key), Deel (key), Remote (key), Oyster (key), Upwork GraphQL (key — moxlade is niche only), Contra (?), Toptal (no)
- **Salaries**: Levels.fyi (no API), Glassdoor (partner), Payscale (no)
- **Real estate**: Zoopla (member), Idealista (paid), Zumper (?), Apartments (?)
- **Legal**: CaseLaw Access Project (free), Justia (?), Google Scholar (no API)
- **Analytics**: Fathom (?), Counter (?), GoatCounter (free), Ackee (?), Shynet (?), Pirsch (?), Swetrix (free tier), OpenPanel (?), Rybbit (?)
- **Uptime**: OhDear (key), StatusCake (key), Pingdom (key)
- **Secrets**: Akeyless (?), Delinea (?), CyberArk (?), Keeper (paid)
- **Flags**: ConfigCat (free tier), Split (?), Harness (?), Bucket (?)
- **Bugs/observability**: Bugsnag (key), Rollbar (key), Airbrake (key), Raygun (key), LogRocket (?), Hotjar (?), Maze (?), Applause (?), Rainforest (?), Mabl (?), Ghost Inspector (?)
- **CI/CD**: CircleCI (key), Jenkins (?), TeamCity (?), Bamboo (?), Azure DevOps (key), Bitbucket (key), Drone (?), Woodpecker (?), Buildkite (key), Semaphore (?), Bitrise (key), Codemagic (?), Codecov (?), Coveralls (?), SonarQube (?), DeepSource (?)
- **Hosting**: Vercel (key), Netlify (key), Cloudflare (key), Render (key), Railway (key), Fly (key), Heroku (key), DigitalOcean (key), Hetzner (key), OVH (?), Scaleway (key), Vultr (key), Linode (key)
- **Logistics**: Global Fishing Watch (free key), SeaRates (?), project44 (?), FourKites (?)
- **Universities**: QS (?), THE (?), ARWU (?), Study.eu (?)
- **Lotteries**: Powerball (?), Mega Millions (?), EuroMillions (?), UK Lotto (?)
- **Space agencies data**: EONET (free key), Earthdata CMR (free), NSIDC (free), GHCN (free), MesoWest/Synoptic (free)
- **Smart home**: Daikin Onecta (free account), Viessmann (free API), NIBE myUplink (free), Samsung SmartThings taken, Nanoleaf LAN (keyless), Tapo/Kasa/Wyze/Eufy/Ring (unofficial), Resideo Honeywell (free), LG ThinQ (unofficial), IKEA Dirigera (no API)
- **Auto**: NHTSA (local), Carfax (no), Copart (member), IAAI (?), BringATrailer (no API), Classic.com (?)
- **Classifieds**: Craigslist RSS (keyless), OLX (no), Mercari (no), Poshmark (no), Depop (no), Vinted (no), ThredUp (no), Reverb taken-ish
