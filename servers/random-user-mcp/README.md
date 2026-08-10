# random-user-mcp

Realistic fake user profiles for testing, seeding, and mock data generation from the RandomUser API. Supports gender and nationality filters and repeatable seeds.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `generate`  Generate random user profiles.
* `seed`  Generate the same profiles every time with a seed.

## Usage

```bash
npm install
npm run build
node dist/index.js
```
