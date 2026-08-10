import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { pricefeed } from "./api.js"
import { ticker } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "gemini-mcp", version: "1.0.0" })
  server.tool("ticker", "Ticker for a symbol.", { symbol: z.string().describe("Symbol like btcusd.") }, async (args) => {
    try { return text(await ticker(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("pricefeed", "List current prices.", {  }, async (args) => {
    try { return text(await pricefeed(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
