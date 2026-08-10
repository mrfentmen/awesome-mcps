# FX Rates MCP

Live currency exchange rates and conversions based on official European Central Bank reference rates. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `latest_rates`  Latest exchange rates for a base currency.
* `convert`  Convert an amount between currencies.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Rates come from the ECB and are updated each business day.
