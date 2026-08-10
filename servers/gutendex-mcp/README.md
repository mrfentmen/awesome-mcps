# Gutendex MCP

Search public domain books in Project Gutenberg via the public Gutendex API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `search`  Search books.
* `book`  Details for one book.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public Gutendex API.
