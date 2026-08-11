import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { depth } from "./api.js"
import { ticker } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "htx-mcp", version: "1.0.0" })
  server.tool("ticker", "Get a market ticker.", { symbol: z.string().describe("Symbol like btcusdt.") }, async (args) => {
    try { return text(await ticker(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("depth", "Get order book depth.", { symbol: z.string().describe("Symbol like btcusdt."), depth: z.number().describe("Depth steps.").optional() }, async (args) => {
    try { return text(await depth(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
