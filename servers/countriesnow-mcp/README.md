# CountriesNow MCP

Country lists, cities, flags, and currencies from the public CountriesNow API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `countries`  List countries.
* `cities`  Cities for a country.
* `flag`  Flag image URL.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public CountriesNow API.
