# Project Gutenberg MCP

Search public domain books and get download links from the Gutendex index of Project Gutenberg. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `search_books`  Search Gutenberg books.
* `book_info`  Details and download links for a book.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Book metadata comes from the public Gutendex API.
