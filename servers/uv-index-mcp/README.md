# UV Index MCP

Get UV index forecasts for any location from the public Open-Meteo API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `uv_forecast`  Daily UV index forecast.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

UV data comes from the public Open-Meteo API.
