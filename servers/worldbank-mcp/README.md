# World Bank MCP

Economic and development indicators from the public World Bank API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `indicator`  Indicator series for a country.
* `countries`  List World Bank countries.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public World Bank API. Economic data feeds that charge elsewhere are free here.
