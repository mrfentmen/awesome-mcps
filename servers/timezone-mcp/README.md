# Timezone MCP

Current time, date, and DST state for any IANA timezone. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `time_in_zone`  Current time in a timezone.
* `list_zones`  Common timezone list.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Times come from the public Time API.
