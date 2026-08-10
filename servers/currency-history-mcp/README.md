# Currency History MCP

Historical currency exchange rates from the public ExchangeRate API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `latest`  Latest rates.
* `history`  Rates for a date range.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public ExchangeRate API, a paid category built free.
