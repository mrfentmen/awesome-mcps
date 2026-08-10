# ISS Position MCP

Live position of the International Space Station from the public Where The ISS At API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `position`  Current ISS position.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public Where The ISS At API.
