# Themealdb MCP

TheMealDB free recipe database: search meals, categories, ingredients, random meal. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `search`  Search meals by name.
* `random`  Get a random meal.
* `categories`  List meal categories.
* `filter_by_ingredient`  Find meals by ingredient.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public Themealdb API.
