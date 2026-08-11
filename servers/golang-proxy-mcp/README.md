# Go Proxy MCP

Go module versions from the public proxy.golang.org API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `latest`  Latest version of a module.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public Go proxy API.
