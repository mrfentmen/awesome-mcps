# rain-radar-mcp

Weather radar tile timeline from RainViewer. Returns the tile host, frame times, and paths you can compose into an animated precipitation map.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `timeline`  Radar tile timeline with past, nowcast, and forecast frames.

## Usage

```bash
npm install
npm run build
node dist/index.js
```
