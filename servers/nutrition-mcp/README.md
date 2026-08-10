# Nutrition MCP

Food nutrition facts from the USDA FoodData Central database. Requires a free USDA key set as USDA_API_KEY.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `search_food`  Search foods with nutrition facts.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Set the USDA_API_KEY environment variable to your free USDA FoodData Central key. Without a key the server returns a clear error.
