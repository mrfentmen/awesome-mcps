# Procurement MCP

Read US federal contract awards from USAspending and nonprofit tax filings from ProPublica. No API key is required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `search_federal_awards`  Federal contract awards by keyword.
* `search_nonprofits`  Nonprofit organizations and filing data.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

USAspending is the official federal spending source. ProPublica nonprofit data mirrors IRS filings.
