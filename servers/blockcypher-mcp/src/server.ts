import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { addressBalance } from "./api.js"
import { blockInfo } from "./api.js"
import { txInfo } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "blockcypher-mcp", version: "1.0.0" })
  server.registerTool(
    "address_balance",
    {
      title: "Address balance",
      description: "Get address balance for a coin.",
      inputSchema: z.object( { coin: z.string().describe("Coin symbol (btc, eth, ltc, doge)."), address: z.string().describe("Address to query.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await addressBalance(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "block_info",
    {
      title: "Block info",
      description: "Get block details.",
      inputSchema: z.object( { coin: z.string().describe("Coin symbol."), height: z.string().describe("Block height or hash.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await blockInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "tx_info",
    {
      title: "Tx info",
      description: "Get transaction details.",
      inputSchema: z.object( { coin: z.string().describe("Coin symbol."), txid: z.string().describe("Transaction hash.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await txInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
