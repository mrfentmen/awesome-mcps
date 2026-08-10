# openFDA MCP

Read FDA openFDA data: drug recalls, adverse event reports, and approved drug applications. No API key is required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `get_drug_recalls`  Recent recalls by product or reason.
* `search_adverse_events`  Adverse event reports by drug name.
* `search_approved_drugs`  Approved drug applications.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

This server respects openFDA rate limits and keeps responses bounded.
