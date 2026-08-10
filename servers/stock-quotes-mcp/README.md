# Stock Quotes MCP

Stock quotes and recent price history from public market data. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `quote`  Current quote and history for a symbol.
* `search_symbol`  Find a symbol by company name.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Market data comes from public chart and search endpoints. Data is delayed and not for trading decisions.
