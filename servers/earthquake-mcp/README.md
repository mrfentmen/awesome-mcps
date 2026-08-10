# earthquake-mcp

Recent earthquakes from the USGS live GeoJSON feed with magnitude, place, depth, and a link to details.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `recent`  Recent earthquakes in a time window.
* `byPlace`  Earthquakes near a place name.

## Usage

```bash
npm install
npm run build
node dist/index.js
```
