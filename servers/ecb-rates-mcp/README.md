# ECB Rates MCP

European Central Bank reference exchange rates from the public Frankfurter API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `latest`  Latest rates.
* `convert`  Convert amounts.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public Frankfurter API, sourced from the ECB.
