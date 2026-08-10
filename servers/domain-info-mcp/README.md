# Domain Info MCP

Domain registration details, nameservers, and status from the RDAP protocol. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `domain_info`  Registration info for a domain.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Uses the public RDAP bootstrap service.
