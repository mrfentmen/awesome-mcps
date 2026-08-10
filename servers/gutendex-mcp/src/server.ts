import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { book } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "gutendex-mcp", version: "1.0.0" })
  server.tool("search", "Search Gutenberg books.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("book", "Details for one book.", { id: z.number().describe("Gutenberg book ID.") }, async (args) => {
    try { return text(await book(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
