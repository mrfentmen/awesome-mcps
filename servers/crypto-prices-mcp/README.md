# Crypto Prices MCP

Live cryptocurrency prices and trending coins from CoinGecko. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `price`  Prices for one or more coins.
* `trending`  Trending coins right now.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public CoinGecko API. Rate limits apply to anonymous use.
