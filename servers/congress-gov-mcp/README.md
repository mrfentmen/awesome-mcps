# Congress.gov MCP

US legislation from the public Congress.gov API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `bills`  Recent bills.
* `search`  Search bills.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public Congress.gov API.
