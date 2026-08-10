# DeFi TVL MCP

Total value locked data for DeFi protocols and chains from DefiLlama. No key required.

This file is self contained. It reads public data only and never writes to the machine. All output is bounded and honest about what could not be fetched.

## Tools


* `top_protocols`  Top protocols by TVL.
* `chain_tvl`  TVL by chain.
* `protocol_info`  Details for one protocol.

## Usage

```bash
npm install
npm run build
node dist/index.js
```

Data comes from the public DefiLlama API.
