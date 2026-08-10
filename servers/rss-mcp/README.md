# RSS MCP

Fetch and parse any RSS or Atom feed into readable entries. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `read_feed`  Read a feed URL.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

The server fetches the feed directly and parses it locally. It reports honest errors for unreachable or malformed feeds.
