# osrs mcp

Old School RuneScape player hiscores + Grand Exchange data, straight from
the official Jagex hiscores and the runescape.wiki prices API. No key.

## Tools

- `get_player_stats`, levels, XP, clue scrolls, boss kill counts
(modes: normal / ironman / ultimate / hardcore / deadman)
- `get_item_price`, current GE buy/sell for any item
- `get_hot_items`, what's trading the most right now (volume, last hour)

## Run

```bash
npm install && npm run build && node dist/index.js
```

## Example

> "Check Zezima's stats"
> `get_player_stats("Zezima")`

> "What's a Bandos chestplate going for?"
> `get_item_price("Bandos chestplate")` → buy 24,459,383 gp / sell 24,440,993 gp

## Quick start

```bash
npm install
npm run build
node dist/index.js
```

The server uses stdio, so it can be connected to Claude Desktop, Cursor, VS Code, MCP Inspector, or another compatible MCP client.

## Tools at a glance

- `get_player_stats`: Get an OSRS player
- `get_item_price`: Get the current Grand Exchange price of an item (buy/sell spread).
- `get_hot_items`: What

## Limits and privacy

This project is intentionally narrow. It should be treated as a practical helper, not a complete certification or security audit. Check the implementation and the returned data before using it with sensitive material. No credentials are required unless the project explicitly says otherwise.

## Try it

After building, connect the server through your MCP client. The repository root also contains `smoke-test.mjs` for projects covered by the shared harness. A typical tool call starts with `get_player_stats`.
