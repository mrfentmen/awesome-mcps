import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { quote } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "twelvedata-mcp", version: "1.0.0" })
  server.tool("quote", "Get a stock quote.", { symbol: z.string().describe("Symbol like AAPL.") }, async (args) => {
    try { return text(await quote(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
