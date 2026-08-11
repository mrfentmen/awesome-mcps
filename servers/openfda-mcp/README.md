# openfda-mcp

FDA open data: drug recalls, adverse events, and approved drugs.

A merged MCP server that consolidates duplicate single-purpose servers in this monorepo into one focused server.

## Tools

- `getDrugRecalls` — Recent FDA drug recalls.
- `searchAdverseEvents` — FDA adverse event reports for a drug.
- `searchApprovedDrugs` — Search approved drug applications.
- `drugEvents` — Adverse event reports for a drug (daily med).

## Run

```bash
npm install
npm run build
node dist/index.js
```

## Source

Public free APIs only. See `src/api.ts` for exact endpoints.
