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
`chmi-mcp` (Czech open-data browser, keyless). Plus built overnight: `statuscake-mcp`,
`pingdom-mcp`, `ohdear-mcp`, `dpla-mcp`, `odysee-mcp` (Lighthouse), `delinea-mcp`,
`cyberark-mcp`, `openpanel-mcp`, `swetrix-mcp`, `split-mcp`, `goatcounter-mcp`,
`deviantart-mcp`, `nanoleaf-mcp`.) Plus built overnight: `ackee-mcp`, `shynet-mcp`,
`rybbit-mcp`, `beaconchain-mcp`, `coinmetrics-mcp`, `hikingproject-mcp`,
`energinet-mcp`, `wpengine-mcp`, `appveyor-mcp`, `isbndb-mcp`, `literal-mcp`,
`synoptic-mcp`, `doab-mcp`, `fingrid-mcp`, `stormglass-mcp`, `quip-mcp`,
`simplecast-mcp`, `blubrry-mcp`, `spreaker-mcp`, `shootproof-mcp`, `turbosquid-mcp`, `cgtrader-mcp`, `playcanvas-mcp`, `seafile-mcp`, `docspell-mcp`, `teedy-mcp`, `filerun-mcp`.)

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
- Hosting: Vercel (official), Netlify (official), Render (official), Railway (official), Fly.io (official flyctl), Heroku, DigitalOcean, Hetzner, OVH, Scaleway, Linode (takashito), Vultr (rsp2k, 335 tools), Jenkins (kud 38 tools + official plugin), Drone CI (3x), TeamCity (Daghis), Bamboo (hmdmph), CircleCI (official), SonarQube (official), Bitrise (official), Azure DevOps
- HR: HiBob (official), Deel (official), BambooHR, Personio (gyopiazza), Fathom (fathomdx), Linear (official), Notion, Jira, Confluence, Airtable (official), Asana, ClickUp, Monday (official), Smartsheet, Coda (official), Redmine, Shortcut, Bugzilla (kud), YouTrack (this repo)
- Analytics: PostHog (official), Mixpanel (local), Amplitude (official), Matomo, GrowthBook (official), Plausible, Umami, Unleash (official), Flagsmith (official), LaunchDarkly, Statsig (official), Checkly, Honeybadger (official), StatusCake (this repo via Composio alt), Pingdom (this repo via Composio alt), Oh Dear (this repo)
- Secrets: Vault (official), 1Password, Bitwarden (this repo), Doppler (this repo), Infisical (this repo), Akeyless (community RTA)
- Video/social: Odysee (this repo; Apify/oanor alts), Tumblr (viaSocket/Zapier/Bright Data), Rumble (no API), Flickr (local), Vimeo (pipeworx), Twitch (local), YouTube (no verified local)
- Patents: EPO (pipeworx/navisbio/JIBSN), USPTO (cyanheads+), WIPO (no public REST found)
- Culture: Gallica (Galica-MCP), Coursera (3x), Papers Past (API uncertain)

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
- Counter.dev, Bucket.co — API hosts dead
- Maze.co, WIPO, Papers Past — API shapes unverifiable
- Rumble, Contra, Zumper, Remote.com (ambiguous squat) — no usable API or unclear ownership
- Shynet, Rybbit, Ackee — self-hosted API schemas need instance docs to verify
- Daikin, Viessmann, NIBE — vendor hosts unreachable from here, retry later
- Marvel API — RETIRED by Marvel, unusable
- JPL Horizons — ssd.jpl.nasa.gov unreachable from here (5 attempts; other .gov works, so likely bot-filtering)
- Copernicus (marine/climate) — guessed paths 404, needs account + docs
- Auckland Transport — api.at.govt.nz routes unverifiable from here (portal docs are JS-driven, no swagger found)

## To research (untouched territory)

Covered by the Build backlog below — this section retired 2026-09-23.

## Build backlog (fresh leads, free APIs known — verify then build)

Auth = free key unless noted keyless. Verify registry+npm+web before building.

**Verified missing on registry (local also missing) — prime build queue:**
- Secrets/flags: Delinea, CyberArk, Split.io, Harness.io, Bucket.co
- Analytics: GoatCounter, Ackee, Shynet, OpenPanel, Rybbit, Fathom Analytics, Counter.dev, Swetrix
- Uptime: OhDear, StatusCake, Pingdom
- Hosting/dev: Render.com, Railway.com, Fly.io, Vercel, Netlify, Linode, Vultr, Coveralls, DeepSource, Jenkins CI, Drone CI, Harness.io (OFFICIAL harness/mcp-server, skip), Maze.co, DPLA, edX
- Jobs/HR: HiBob, Deel, Remote.com, Oyster, Zumper, Personio HR API, Contra
- Legal: CaseLaw Access Project (cap.law)
- Social/video: Rumble, Odysee, DeviantArt
- Registries/IoT: Maven Central, crates.io, CRAN, Daikin, Viessmann, NIBE, Nanoleaf
- Patents: WIPO PATENTSCOPE
- Oceans: OBIS
- Outdoors: Trailforks
- Culture: Gallica BnF, Papers Past NZ, Coursera
- Programs (genres 1-12 sweep): Quip (built), Simplecast (built), Gab (Cloudflare-walled, drop), Dreamwidth (host dead, drop), plus unverified backlog below

**Still to verify (registry not yet probed):**
- Docs/notes: Guru, HedgeDoc, RemNote, SuperNotes, Craft, CommaFeed
- Podcast: Podbean (taken), Libsyn (no public podcast API — status-page API + cookie-scrape only, skip), Blubrry (built), Spreaker (built), RedCircle (api base 404, skip), RSS.com (Express 404 on guessed paths, skip), Acast (host blocked 000, skip), Restream (OFFICIAL MCP at developers.restream.io/mcp-server, skip), Zencastr (no public API, skip), BBC, Radiotopia, PRX
- Photo: Zenfolio (SOAP .asmx API only, skip), Pixieset (unofficial only, skip), ShootProof (built), PicTime (no public API — Zapier/partners only, skip)
- 3D: TurboSquid (built — Token header required on all calls), CGTrader (built), Godot assets, PlayCanvas (built), Verge3D, Vectary
- EDA: OSH Park (API access by support request only, skip), Aisler, SnapEDA/SnapMagic (API on request via form, no public docs, skip), Ultra Librarian, SamacSys
- Self-hosted docs: Docspell (built), Teedy (built), FileRun (built), ownCloud, Seafile (built), Pydio, Resilio, Kopia
- Research: Mendeley (taken), SciFlow (enterprise, skip), Curvenote (CLI only, skip), PubPub (SDK only, skip)
- Scheduling: Amie, Ellie, Sunsama, SavvyCal
- Design/social: Penpot (paths uncertain, skip), Canva (official, skip), VK (taken 2x, skip), Minds (uncertain, skip), Framer (dead host, skip)
- CAD remainder (SketchUp, Rhino, Tekla, VectorWorks, BricsCAD, DraftSight, Shapr3D): desktop programs, no public cloud APIs — skip batch

**Still to verify (registry not yet probed):**
- Health/edu: CDC WONDER, NCES, GreatSchools, ISBNdb, Literal
- Patents: J-PlatPat, KIPRIS, IP Australia, CIPO, EUIPO, Lens.org
- Standards: ETSI, W3C, OGC, FIDO, OpenID, FHIR servers
- Oceans: PSMSL, IOOS, Argo, GEBCO, EMODnet, Observation.org, Movebank, Motus
- Outdoors: Hiking Project, Outdooractive, ABRP, Tronity, evcc
- Space data: Earthdata CMR, NSIDC, GHCN, MesoWest
- Auto: Carfax (no), Copart (member), IAAI, BringATrailer (no API), Classic.com
- Classifieds: Craigslist RSS, OLX (no), Mercari (no), Poshmark (no), Depop (no), Vinted (no), ThredUp (no)
- Logistics: Global Fishing Watch, SeaRates, project44, FourKites
- Universities: QS, THE, ARWU, Study.eu
- Lotteries: Powerball, Mega Millions, EuroMillions, UK Lotto
- Social: YouTube (key), TikTok (approval), 500px, Dribbble, BeReal, Nextdoor, Viber, Line, Kakao, ArtStation (no API), Behance (no API)
- Music: Apple Music, Tidal, Qobuz, Napster, Pandora, SiriusXM, Libby, Hoopla, Kanopy
- Smart home: Tapo/Kasa/Wyze/Eufy/Ring (unofficial), Resideo, LG ThinQ (unofficial)
- Salaries/others: Levels.fyi (no API), Glassdoor (partner-only), PayScale (no API), Zoopla (member), Idealista (paid), Justia (no API), Toptal (no API)
- Transit: VIA Rail, Indian Railways (no public API found yet — recheck)
