# Yr Metno MCP

Norwegian Meteorological Institute (api.met.no) weather forecasts: locationforecast and nowcast. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `forecast`  Compact location forecast for a point.
* `nowcast`  Short-term nowcast for a point.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public Yr Metno API.
