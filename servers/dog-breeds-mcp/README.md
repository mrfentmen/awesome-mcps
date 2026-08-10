# Dog Breeds MCP

Dog breed lists and random images from the public dog API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `list_breeds`  All dog breeds.
* `random_image`  Random dog image.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public dog API.
