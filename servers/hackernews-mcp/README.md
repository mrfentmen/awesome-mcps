# Hacker News MCP

Hacker News stories and search from the public Algolia API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `search`  Search stories.
* `top`  Top stories.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public Hacker News Algolia API.
