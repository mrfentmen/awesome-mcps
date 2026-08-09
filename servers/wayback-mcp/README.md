# Wayback

Use this MCP server to the Wayback Machine, snapshot history, page availability, and dead site recovery.

## Quick start

```bash
npm install
npm run build
node dist/index.js
```

The server uses stdio, so it can be connected to Claude Desktop, Cursor, VS Code, MCP Inspector, or another compatible MCP client.

## Tools at a glance

- `get_snapshots`: List the Wayback Machine snapshot history for a URL.
- `get_availability`: Check whether a page is archived and get its closest snapshot.
- `read_snapshot`: Read the text content of an archived page, for reading dead sites.

## Limits and privacy

This project is intentionally narrow. It should be treated as a practical helper, not a complete certification or security audit. Check the implementation and the returned data before using it with sensitive material. No credentials are required unless the project explicitly says otherwise.

## Try it

After building, connect the server through your MCP client. The repository root also contains `smoke-test.mjs` for projects covered by the shared harness. A typical tool call starts with `get_snapshots`.
