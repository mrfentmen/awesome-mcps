# Podcast Search MCP

Search podcasts and top charts from the public iTunes catalog. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `search_podcasts`  Search podcasts.
* `top_podcasts`  Top podcasts.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Catalog data comes from the public iTunes Search API.
