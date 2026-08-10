import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { categories } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "emoji-mcp", version: "1.0.0" })
  server.tool("search", "Find emoji matching a keyword.", { query: z.string().describe("Keyword like smile or heart."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("categories", "List emoji categories.", {  }, async (args) => {
    try { return text(await categories(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
