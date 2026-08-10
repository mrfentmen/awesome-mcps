# Jolpica MCP

Formula 1 data from the public Jolpica API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `current`  Current season.
* `races`  Season races.
* `drivers`  Season drivers.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public Jolpica API.
