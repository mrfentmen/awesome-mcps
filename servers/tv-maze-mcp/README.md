# TVMaze MCP

Search TV shows, list episodes, and check today schedule from the public TVMaze API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `search_shows`  Search for TV shows.
* `show_episodes`  Episodes for a show.
* `today_schedule`  Shows airing today.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public TVMaze API.
