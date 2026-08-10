# Holidays MCP

Public holidays for any country and year from Nager.Date. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `public_holidays`  Holidays for a country and year.
* `next_holidays`  Next upcoming holidays.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the Nager.Date public API.
