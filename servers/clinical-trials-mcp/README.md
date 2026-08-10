# Clinical Trials MCP

Read clinical trial studies from ClinicalTrials.gov and research articles from PubMed. No API key is required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `search_clinical_trials`  Trial search by condition or keyword.
* `get_trial`  One trial by NCT id.
* `search_pubmed`  PubMed article search.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Both sources are free public APIs with bounded rate limits.
