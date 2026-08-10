import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { ticker } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "mexc-mcp", version: "1.0.0" })
  server.tool("ticker", "Current price for a trading pair.", { symbol: z.string().describe("Pair like BTCUSDT.") }, async (args) => {
    try { return text(await ticker(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
