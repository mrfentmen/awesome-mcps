# wikidata-mcp

A compact interface to Wikidata for entity lookup and structured public knowledge exploration.

## Tools

- `search_entities`: search labels and descriptions.
- `get_entity`: fetch English labels, descriptions, claims, and sitelinks for a Q id.
- `query_knowledge`: run a bounded, read-only SPARQL query.

SPARQL input is capped at 8,000 characters and blocks write, federation, and dataset-management operations. Include a selective `LIMIT` in queries. Wikidata statements vary in completeness and should be checked against their references for important work.

## Run

```bash
npm install
npm run build
node dist/index.js
```

## Quick start

```bash
npm install
npm run build
node dist/index.js
```

The server uses stdio, so it can be connected to Claude Desktop, Cursor, VS Code, MCP Inspector, or another compatible MCP client.

## Tools at a glance

- `search_entities`: Search Wikidata entities by name or description.
- `get_entity`: Get public Wikidata labels, descriptions, claims, and sitelinks by Q ID.
- `query_knowledge`: Run a bounded read-only SPARQL query against Wikidata. Keep queries selective and include LIMIT.

## Limits and privacy

This project is intentionally narrow. It should be treated as a practical helper, not a complete certification or security audit. Check the implementation and the returned data before using it with sensitive material. No credentials are required unless the project explicitly says otherwise.

## Try it

After building, connect the server through your MCP client. The repository root also contains `smoke-test.mjs` for projects covered by the shared harness. A typical tool call starts with `search_entities`.
