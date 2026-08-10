# Mars Weather MCP

Mars weather reports from the NASA InSight lander. Uses the free NASA demo key by default or your own NASA_API_KEY.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `latest_weather`  Latest Mars weather.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Uses the NASA InSight API. The demo key pool can rate limit at busy times; a free NASA_API_KEY is recommended.
