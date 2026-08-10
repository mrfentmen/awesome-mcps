# RSS2JSON MCP

Convert any RSS feed into JSON using the public RSS2JSON API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `feed`  Fetch an RSS feed.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public RSS2JSON API.
