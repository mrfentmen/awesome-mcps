import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { pageQuotes } from "./api.js"
import { searchQuotes } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "wikiquote-mcp", version: "1.0.0" })
  server.tool("search_quotes", "Search Wikiquote pages.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchQuotes(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("page_quotes", "Get quotes from a Wikiquote page.", { page: z.string().describe("Page title."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await pageQuotes(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
