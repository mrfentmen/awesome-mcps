# Open Holidays MCP

Public holidays from the Open Holidays API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `countries`  Supported countries.
* `holidays`  Holidays for a country.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public Open Holidays API.
