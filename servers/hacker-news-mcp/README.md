# hacker-news-mcp

Top stories, jobs, and ask threads from the Hacker News Firebase API with item detail lookup.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `top`  Top stories.
* `jobs`  Latest job postings.
* `ask`  Latest ask threads.
* `item`  One story or comment by ID.

## Usage

```bash
npm install
npm run build
node dist/index.js
```
