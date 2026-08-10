# TheAudioDB MCP

Music artist, album, and track data from the public TheAudioDB API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `artist`  Search artists.
* `album`  Albums by artist.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public TheAudioDB API. Music data is a paid category built free.
