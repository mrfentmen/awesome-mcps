# Breweries MCP

Find craft breweries by name, city, or state from the public OpenBreweryDB. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `by_city`  Breweries in a city.
* `search`  Search by name.
* `by_state`  Breweries in a state.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public OpenBreweryDB API.
