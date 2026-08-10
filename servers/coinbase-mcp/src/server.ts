import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { exchange } from "./api.js"
import { spot } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "coinbase-mcp", version: "1.0.0" })
  server.tool("spot", "Spot price for a pair.", { pair: z.string().describe("Pair like BTC-USD.") }, async (args) => {
    try { return text(await spot(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("exchange", "Exchange rates.", { currency: z.string().describe("Base currency like USD.").optional() }, async (args) => {
    try { return text(await exchange(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
