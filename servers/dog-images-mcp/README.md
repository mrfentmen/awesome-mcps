# Dog Images MCP

Random dog pictures by breed from the public dog.ceo API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `random_dog`  A random dog picture.
* `by_breed`  A picture for a breed.
* `list_breeds`  All breeds.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Images come from the public dog.ceo API.
