import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { addressBalance } from "./api.js"
import { blockInfo } from "./api.js"
import { txInfo } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "blockcypher-mcp", version: "1.0.0" })
  server.tool("address_balance", "Get address balance for a coin.", { coin: z.string().describe("Coin symbol (btc, eth, ltc, doge)."), address: z.string().describe("Address to query.") }, async (args) => {
    try { return text(await addressBalance(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("block_info", "Get block details.", { coin: z.string().describe("Coin symbol."), height: z.string().describe("Block height or hash.") }, async (args) => {
    try { return text(await blockInfo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("tx_info", "Get transaction details.", { coin: z.string().describe("Coin symbol."), txid: z.string().describe("Transaction hash.") }, async (args) => {
    try { return text(await txInfo(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
