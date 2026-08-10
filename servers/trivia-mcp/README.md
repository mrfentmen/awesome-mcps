# Trivia MCP

Fetch trivia questions from the Open Trivia Database by category and difficulty. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `get_question`  A random trivia question.
* `categories`  Available categories.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Questions come from the public Open Trivia Database API.
