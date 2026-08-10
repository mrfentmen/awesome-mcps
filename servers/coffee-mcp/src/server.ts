import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { hot } from "./api.js"
import { iced } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "coffee-mcp", version: "1.0.0" })
  server.tool("hot", "Hot coffee drinks.", { limit: z.number().describe("Maximum results.").optional() }, async (args) => {
    try { return text(await hot(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("iced", "Iced coffee drinks.", { limit: z.number().describe("Maximum results.").optional() }, async (args) => {
    try { return text(await iced(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search", "Search drinks by keyword.", { query: z.string().describe("Keyword."), limit: z.number().describe("Maximum results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
