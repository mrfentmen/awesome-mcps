import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { recent } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "openplaques-mcp", version: "1.0.0" })
  server.tool("recent", "Recent plaques.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await recent(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search", "Search plaques by inscription.", { query: z.string().describe("Search text."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
