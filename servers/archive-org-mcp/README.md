# archive org mcp

MCP server for the **Internet Archive**, the largest library on earth.

## Tools

| Tool | What it does |
|---|---|
| `search_items` | Search ~200M items, filterable by media type (software, audio, movies, texts, web…) |
| `get_item` | Full item details + file manifest with sizes/formats |

## Usage

```bash
npm run build && node dist/index.js
```

Example:

```
search_items { query: "sonic the hedgehog prototype", mediatype: "software" }
get_item { identifier: "sonic-the-hedgehog-triple-trouble-prototype-aug-161994..." }
```

Keyless. Great for abandoned CD ROM software, bootleg concert tapes, 78rpm records, Geocities snapshots, and old Flash games. Item entries include download counts; manifests show file sizes and formats.

## Quick start

```bash
npm install
npm run build
node dist/index.js
```

The server uses stdio, so it can be connected to Claude Desktop, Cursor, VS Code, MCP Inspector, or another compatible MCP client.

## Tools at a glance

- `search_items`: Search the Internet Archive - old software, abandoned CD-ROM games,
- `get_item`: Get full details + file manifest for an archive.org item.

## Limits and privacy

This project is intentionally narrow. It should be treated as a practical helper, not a complete certification or security audit. Check the implementation and the returned data before using it with sensitive material. No credentials are required unless the project explicitly says otherwise.

## Try it

After building, connect the server through your MCP client. The repository root also contains `smoke-test.mjs` for projects covered by the shared harness. A typical tool call starts with `search_items`.
