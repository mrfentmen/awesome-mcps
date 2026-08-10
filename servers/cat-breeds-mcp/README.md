# Cat Breeds MCP

Cat breed details including temperament and origin from the public cat API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `list_breeds`  Cat breeds.
* `breed_info`  A specific breed.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public cat API.
