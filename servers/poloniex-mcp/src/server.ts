import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { markets } from "./api.js"
import { ticker } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "poloniex-mcp", version: "1.0.0" })
  server.tool("ticker", "Ticker for a market.", { symbol: z.string().describe("Market like BTC_USDT.") }, async (args) => {
    try { return text(await ticker(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("markets", "List markets.", {  }, async (args) => {
    try { return text(await markets(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
