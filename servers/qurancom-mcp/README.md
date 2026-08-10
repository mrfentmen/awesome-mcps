# Quran.com MCP

Quran data from the public Quran.com API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `chapters`  List chapters.
* `chapter`  Get a chapter.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public Quran.com API.
