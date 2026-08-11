# TVMaze MCP

TV shows and schedules from the public TVMaze API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `search`  Search shows.
* `schedule`  Episode schedule.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public TVMaze API.
