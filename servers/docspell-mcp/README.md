# docspell-mcp

Query the Docspell document management REST API: server version (public), full-text item search, and item details. Works with any Docspell server via `DOCSPELL_BASE_URL` (default http://localhost:7880); search/detail need `DOCSPELL_AUTH_TOKEN` (from POST /open/auth/login, header X-Docspell-Auth).

## Tools

- `get_version` — Docspell server version info. Public, no auth needed.
- `search_items` — Full-text document search (requires DOCSPELL_AUTH_TOKEN).
- `get_item` — Document item details by ID (requires DOCSPELL_AUTH_TOKEN).

## Source

[docspell-mcp](https://github.com/mrfentmen/awesome-mcps/tree/main/servers/docspell-mcp)
