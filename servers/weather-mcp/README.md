# Weather MCP

Read terrestrial weather and hazards: NWS forecasts, USGS earthquakes, and FEMA disaster declarations. No API key is required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `get_forecast`  NWS forecast for any coordinates.
* `get_earthquakes`  Recent earthquakes from USGS.
* `get_fema_disasters`  Recent FEMA disaster declarations.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

This is the terrestrial companion to the existing NOAA space weather server.
