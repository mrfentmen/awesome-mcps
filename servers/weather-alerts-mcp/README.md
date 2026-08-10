# Weather Alerts MCP

Active weather alerts, watches, and warnings from the National Weather Service. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `active_alerts`  Alerts for a state.
* `alerts_for_point`  Alerts near a location.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Alerts come from the public NWS API.
