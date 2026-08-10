# Quran MCP

Read Quran verses and chapters in Arabic and English from the public alQuran.cloud API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `verse`  A verse in Arabic and English.
* `chapter_info`  Details for a chapter.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Text comes from the public alQuran.cloud API.
