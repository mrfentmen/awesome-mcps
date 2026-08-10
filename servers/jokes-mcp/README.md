# Jokes MCP

Fetch dad jokes from the public icanhazdadjoke API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `random_joke`  A random dad joke.
* `search_jokes`  Search for dad jokes.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Jokes come from the public icanhazdadjoke API.
