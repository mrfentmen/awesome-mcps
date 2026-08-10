# ISS MCP

Live position, velocity, and altitude of the International Space Station, plus upcoming passes over any location. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `iss_now`  Current ISS position and speed.
* `iss_passes`  Upcoming passes over a location.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Position data comes from the wheretheiss public API.
