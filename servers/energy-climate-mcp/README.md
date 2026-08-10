# Energy Climate MCP

Read energy and climate indicators from the World Bank with optional EIA energy series. No key is required for World Bank data.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `get_worldbank_indicator`  World Bank development indicators by country.
* `get_eia_series`  EIA energy series with a free key.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Set the EIA_API_KEY environment variable to use EIA. World Bank data needs no key.
