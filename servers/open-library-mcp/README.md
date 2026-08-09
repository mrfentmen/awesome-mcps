# Open Library MCP

Search books, authors, works, and editions through Open Library. No API key is required.

## Tools

* `search_books`
* `get_work`
* `get_author`
* `list_editions`

## Run

```bash
npm install
npm run build
node dist/index.js
```

The client sends a descriptive User Agent and limits results to keep responses useful.

## Quick start

```bash
npm install
npm run build
node dist/index.js
```

The server uses stdio, so it can be connected to Claude Desktop, Cursor, VS Code, MCP Inspector, or another compatible MCP client.

## Tools at a glance

- `search_books`: Search Open Library for books, authors, subjects, or ISBNs.
- `get_work`: Get detailed metadata for an Open Library work.
- `get_author`: Get metadata for an Open Library author.
- `list_editions`: List editions of an Open Library work.

## Limits and privacy

This project is intentionally narrow. It should be treated as a practical helper, not a complete certification or security audit. Check the implementation and the returned data before using it with sensitive material. No credentials are required unless the project explicitly says otherwise.

## Try it

After building, connect the server through your MCP client. The repository root also contains `smoke-test.mjs` for projects covered by the shared harness. A typical tool call starts with `search_books`.
