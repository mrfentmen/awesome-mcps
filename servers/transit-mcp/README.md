# Transit MCP

Read real time SEPTA transit data: next train arrivals and live vehicle positions. No API key is required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `get_next_arrivals`  Next arrivals between two stations.
* `get_transit_view`  Live vehicle positions for a route.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

SEPTA publishes a public hackathon API. GTFS based transit feeds from other agencies can be added later.
