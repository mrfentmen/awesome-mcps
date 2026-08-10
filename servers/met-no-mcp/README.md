# Met.no Weather MCP

Weather forecast from the public Norwegian Meteorological Institute API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `forecast`  Forecast for coordinates.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public Met.no API. Weather data is a paid category built free.
