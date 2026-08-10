# Flights MCP

Live aircraft positions from the OpenSky Network. Find planes near you or inside any region. No key required for anonymous use.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `flights_near`  Aircraft within a radius of a location.
* `flights_in_box`  Aircraft inside a latitude longitude box.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

The OpenSky anonymous API limits how often data can be pulled. The server handles those limits and reports honest errors when the feed is busy.
