import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { quote } from "./api.js"
import { searchSymbol } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "stock-quotes-mcp", version: "1.0.0" })
  server.tool("quote", "Get the current quote and recent price history for a symbol.", { symbol: z.string().describe("Stock symbol like AAPL."), days: z.number().describe("Days of history.").optional() }, async (args) => {
    try { return text(await quote(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search_symbol", "Search for a symbol by company name.", { query: z.string().describe("Company name.") }, async (args) => {
    try { return text(await searchSymbol(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
