# Urban Dictionary MCP

Look up slang definitions and examples from the public Urban Dictionary API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `define`  Definitions for a term.
* `random`  A random entry.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Entries come from the public Urban Dictionary API.
