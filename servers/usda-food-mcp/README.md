# USDA Food MCP

Search USDA food composition data from the public FoodData Central API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `search`  Search foods.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public USDA FoodData Central API.
