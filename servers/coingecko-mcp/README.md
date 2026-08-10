# CoinGecko MCP

Crypto prices and market data from the public CoinGecko API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `price`  Price for one coin.
* `trending`  Trending coins.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public CoinGecko API. Crypto data is a paid category built free.
