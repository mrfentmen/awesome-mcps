# Metal Prices MCP

Spot prices for gold, silver, platinum, and palladium from the public Gold API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `price`  Spot price for one metal.
* `all`  Prices for all metals.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public Gold API. Metals data is a paid category built free.
