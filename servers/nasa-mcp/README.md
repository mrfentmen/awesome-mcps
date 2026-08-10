# NASA MCP

Read NASA open data: the astronomy picture of the day, near earth objects, and Mars rover photos. Uses the free NASA demo key by default or your own key.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `get_apod`  Astronomy picture of the day with explanation.
* `get_neo`  Near earth objects in a date range.
* `get_mars_photos`  Mars rover photos by rover, sol, and camera.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Set the NASA_API_KEY environment variable to your free key for higher rate limits. Without it, the demo key is used with strict limits.
