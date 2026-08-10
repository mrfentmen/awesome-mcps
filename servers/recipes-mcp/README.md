# Recipes MCP

Search recipes by name or ingredient and read full instructions from TheMealDB. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `search_recipes`  Search recipes by name.
* `by_ingredient`  Recipes using an ingredient.
* `recipe_details`  Full recipe details.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Recipe data comes from the public TheMealDB API.
