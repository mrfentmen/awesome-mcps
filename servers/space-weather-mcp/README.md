# Space Weather MCP

Read only NOAA Space Weather Prediction Center data for solar wind speed, current scales, and alerts. No key is required.

## Tools

* `get_solar_wind`
* `get_noaa_scales`
* `get_alerts`

```bash
npm install
npm run build
node dist/index.js
```

## Quick start

```bash
npm install
npm run build
node dist/index.js
```

The server uses stdio, so it can be connected to Claude Desktop, Cursor, VS Code, MCP Inspector, or another compatible MCP client.

## Tools at a glance

- `get_solar_wind`: Get recent NOAA proton solar wind speed readings.
- `get_noaa_scales`: Get NOAA current radio, solar radiation, and geomagnetic scales.
- `get_alerts`: Get recent NOAA Space Weather Prediction Center alerts.

## Limits and privacy

This project is intentionally narrow. It should be treated as a practical helper, not a complete certification or security audit. Check the implementation and the returned data before using it with sensitive material. No credentials are required unless the project explicitly says otherwise.

## Try it

After building, connect the server through your MCP client. The repository root also contains `smoke-test.mjs` for projects covered by the shared harness. A typical tool call starts with `get_solar_wind`.
