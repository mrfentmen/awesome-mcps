# Countries MCP

Look up country details, flags, capitals, and population from the public REST Countries API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `by_name`  Country details by name.
* `by_code`  Country details by code.
* `search`  Search by partial name.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public REST Countries API.
