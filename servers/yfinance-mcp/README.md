# Yfinance MCP

Yahoo Finance chart API: stock quotes, prices, and basic chart data. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `quote`  Get a stock quote and recent price data.
* `search`  Search stock symbols.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public Yfinance API.
