# Timeapi MCP

TimeAPI.io: current time, conversion and zones. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `current`  Current time in a zone.
* `convert`  Convert time between zones.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public Timeapi API.
