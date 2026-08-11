# Er Api MCP

Open Exchange Rates (open.er-api.com): free currency exchange rates. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `latest`  Get latest exchange rates.
* `convert`  Convert an amount between currencies.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public Er Api API.
