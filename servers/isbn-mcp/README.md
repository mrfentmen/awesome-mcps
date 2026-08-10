# ISBN MCP

Validate ISBN checksums locally and look up book metadata from the public Open Library API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `validate`  Check an ISBN checksum.
* `lookup`  Book metadata for an ISBN.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Checksums are computed locally. Metadata comes from the public Open Library API.
