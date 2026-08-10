import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { assets } from "./api.js"
import { ticker } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "kraken-mcp", version: "1.0.0" })
  server.tool("ticker", "Ticker for a pair.", { pair: z.string().describe("Pair like XBTUSD.") }, async (args) => {
    try { return text(await ticker(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("assets", "List tradeable assets.", {  }, async (args) => {
    try { return text(await assets(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
