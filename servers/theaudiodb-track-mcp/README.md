# TheAudioDB Track MCP

Track level music data from the public TheAudioDB API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `track`  Details for one track.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public TheAudioDB API.
