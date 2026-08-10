# OpenSky MCP

Live flight positions from the public OpenSky API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `area`  Flights in an area.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public OpenSky API.
