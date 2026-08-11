import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { quote } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "yfinance-mcp", version: "1.0.0" })
  server.tool("quote", "Get a stock quote and recent price data.", { symbol: z.string().describe("Stock symbol like AAPL."), range: z.string().describe("Range like 5d, 1mo, 1y.").optional() }, async (args) => {
    try { return text(await quote(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search", "Search stock symbols.", { query: z.string().describe("Company name or symbol.") }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
