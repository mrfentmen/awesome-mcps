# MCP Servers I Will Make

Batch 2 and beyond. All of these are buildable for free, use real public data or real local computation, and most overlap with products people pay money for. No mocks, no placeholders, no pretend APIs. Every server follows the house conventions: TypeScript, MCP SDK, Zod, stdio transport, `server.json`, README, and a live smoke test against the real source.

## Tier 1: Paid product categories we can build for free

| Server | Free source | Why people pay for this |
|---|---|---|
| `tmdb-mcp` | The Movie Database free key | Movies, TV, trending, search. Media apps and agents pay for this constantly |
| `pdf-generator-mcp` | pdf-lib, pure JS | PDF generation is a sold category. Invoices, reports, certificates, all local |
| `excel-mcp` | ExcelJS, pure JS | Spreadsheet creation, editing, and export. Sheet automation is a paid category |
| `email-validator-mcp` | MX record lookup plus disposable domain list | Email verification is a paid SaaS category. Free via DNS |
| `uptime-mcp` | Plain HTTP checks | Monitoring sells as SaaS. Latency, status codes, cert expiry, all local |
| `image-tools-mcp` | Pure JS resize, compress, EXIF strip | Image processing MCPs are sold. Local means free |
| `ics-generator-mcp` | Pure JS .ics output | Calendar and scheduling MCPs are paid. Generate real calendar files for free |
| `qr-code-mcp` | Pure JS QR encoding | QR generation is a paid API category. Runs fully offline |
| `barcode-mcp` | Pure JS barcode encoding | Same play as QR. Local generation, zero cost |

## Tier 2: Strong free data plays

| Server | Free source |
|---|---|
| `gdelt-mcp` | GDELT, keyless, enormous global news archive |
| `sports-scores-mcp` | ESPN public JSON, keyless |
| `flights-mcp` | OpenSky Network, free, keyless |
| `osm-geocode-mcp` | OpenStreetMap Nominatim, keyless |
| `fx-rates-mcp` | Frankfurter / ECB rates, keyless |
| `air-quality-mcp` | Open-Meteo air quality, keyless |
| `dictionary-mcp` | Free Dictionary API, keyless |
| `translation-mcp` | MyMemory and LibreTranslate, keyless |
| `nutrition-mcp` | USDA FoodData Central, free key |
| `bls-mcp` | BLS public JSON, keyless |
| `holidays-mcp` | Nager.Date, keyless |
| `timezone-mcp` | Time API, keyless |
| `podcasts-mcp` | iTunes Search API, keyless |
| `lyrics-mcp` | lyrics.ovh, keyless |
| `quotes-mcp` | Quotable, keyless |
| `poetry-db-mcp` | PoetryDB, keyless. Pairs with the poetry skill collection |
| `launch-schedule-mcp` | Launch Library, keyless |
| `radio-mcp` | radio-browser keyless directory of thousands of stations |
| `lobsters-mcp` | lobste.rs API, keyless |
| `iss-mcp` | Open Notify ISS position, keyless |
| `moon-phase-mcp` | Astronomical calculation, pure JS |
| `sunrise-sunset-mcp` | Sunrise Sunset API, keyless |
| `aurora-mcp` | NOAA aurora forecast, keyless |
| `lastfm-mcp` | Last.fm free key |
| `discogs-mcp` | Discogs free key |

## Tier 3: Developer infrastructure and utility

| Server | Source |
|---|---|
| `package-registry-mcp` | npm and PyPI registries, keyless |
| `npm-info-mcp` | npm registry, keyless |
| `pypi-info-mcp` | PyPI JSON API, keyless |
| `crates-info-mcp` | crates.io API, keyless |
| `maven-info-mcp` | Maven Central API, keyless |
| `docker-info-mcp` | Docker Hub API, keyless |
| `json-tools-mcp` | Pure JS validate, format, query, diff |
| `yaml-mcp` | Pure JS parse and convert |
| `csv-mcp` | Pure JS parse, filter, convert |
| `markdown-mcp` | Pure JS convert markdown to HTML |
| `html-to-markdown-mcp` | Pure JS converter |
| `regex-mcp` | Pure JS test and explain regular expressions |
| `cron-mcp` | Pure JS parse and describe cron expressions |
| `semver-mcp` | Pure JS compare, sort, and explain versions |
| `checksum-mcp` | Pure JS md5 and sha hashing |
| `ssl-cert-mcp` | TLS handshake cert inspection, local |
| `whois-mcp` | WHOIS lookup, public servers |
| `ip-geo-mcp` | ip-api.com keyless geolocation |
| `breach-check-mcp` | Have I Been Pwned k anonymity API, no password sent |
| `scam-scan-mcp` | urlscan.io free key |
| `malware-hash-mcp` | VirusTotal free key |
| `rss-mcp` | Fetch and parse any RSS or Atom feed |
| `html-meta-mcp` | Fetch title, description, and open graph tags for link previews |

## Tier 4: Creative and fun, still real

| Server | Source |
|---|---|
| `avatar-mcp` | DiceBear and initials, pure |
| `name-generator-mcp` | Pure generated names |
| `password-generator-mcp` | Pure secure generation |
| `otp-mcp` | Pure TOTP and HOTP |
| `word-of-day-mcp` | Free Dictionary plus curated list |
| `anagram-mcp` | Pure word rearrangement |
| `chord-mcp` | Pure music theory, chords and scales |
| `midi-tools-mcp` | Pure MIDI note math. Pairs with the chiptune extension |
| `metronome-mcp` | Pure tempo and time signature math |
| `lorem-mcp` | Pure generated filler text |

## Priority for the next build batch

1. `tmdb-mcp` because movies and TV search has the biggest paid overlap
2. `pdf-generator-mcp` because PDF generation is a proven paid category and runs fully local
3. `gdelt-mcp` because keyless global news is a monster dataset
4. `email-validator-mcp` because email verification is a sold product built from free DNS
5. `sports-scores-mcp` because everyone wants scores and the source is keyless
6. `excel-mcp` and `ics-generator-mcp` because office automation is the most reliable paid lane

Every server in this list gets the same treatment as the first 16: real API calls, bounded outputs, honest errors when a key is missing, a README with no dashes, tests, and a live smoke pass before it lands in `servers/`.
