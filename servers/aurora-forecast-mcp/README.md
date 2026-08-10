# aurora-forecast-mcp

Current aurora activity and forecast from the NOAA Space Weather Prediction Center ovation model.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `latest`  Latest aurora observation and forecast time.
* `map`  Describe the aurora forecast map coverage.

## Usage

```bash
npm install
npm run build
node dist/index.js
```
