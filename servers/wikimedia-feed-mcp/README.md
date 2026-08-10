# Wikimedia Feed MCP

Random images from Wikimedia Commons from the public API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `random`  Random image files.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public Wikimedia Commons API.
