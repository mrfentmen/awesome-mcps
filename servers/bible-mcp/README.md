# Bible MCP

Read Bible verses by reference from the public Bible API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `verse`  Read a verse or passage.
* `search`  Search for a phrase.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Text comes from the public Bible API.
