# USAspending MCP

Federal spending agencies and award searches from the public USAspending API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `agencies`  Top tier federal agencies.
* `search_awards`  Search federal awards.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public USAspending API, the official federal spending transparency source.
