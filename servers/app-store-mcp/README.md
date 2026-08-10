# App Store MCP

Top charts and app details from the public Apple App Store feeds. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `top_free`  Top free apps.
* `top_paid`  Top paid apps.
* `app_lookup`  Details for one app.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public Apple iTunes and App Store feeds.
