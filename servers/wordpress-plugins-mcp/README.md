# WordPress Plugins MCP

Look up WordPress plugins, downloads, and ratings from the public WordPress API. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `plugin_info`  Details for a plugin.
* `search_plugins`  Search plugins.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public WordPress.org API.
