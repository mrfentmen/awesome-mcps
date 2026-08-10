# Wikimedia Commons MCP

Search images and files on Wikimedia Commons from the public MediaWiki API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `search`  Search files.
* `file`  Details for one file.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public Wikimedia Commons API. Stock image search products charge for this.
