# Geocoding MCP

Geocode addresses and reverse geocode coordinates with the public Nominatim API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `geocode`  Coordinates for a place.
* `reverse`  Address for coordinates.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Nominatim asks clients to send a descriptive User Agent and to make at most one request per second. The server does exactly that.
