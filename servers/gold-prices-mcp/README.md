# Gold Prices MCP

Live gold, silver, platinum, and palladium prices from the public Gold API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `price`  Current price for a metal.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Prices come from the public Gold API and update throughout the day.
