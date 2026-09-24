# seafile-mcp

Query the Seafile Web API: list libraries, library info, default library, and file details. Works with any Seafile server via `SEAFILE_BASE_URL` (default https://cloud.seafile.com) and `SEAFILE_API_TOKEN` (from POST /api2/auth-token/).

## Tools

- `list_libraries` — All libraries the token can access.
- `get_library_info` — Seafile library metadata.
- `get_default_library` — The account default library.
- `get_file_detail` — Metadata of a file in a library.

## Source

[seafile-mcp](https://github.com/mrfentmen/awesome-mcps/tree/main/servers/seafile-mcp)
