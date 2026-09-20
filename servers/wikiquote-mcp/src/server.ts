import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { pageQuotes } from "./api.js"
import { searchQuotes } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "wikiquote-mcp", version: "1.0.0" })
  server.registerTool(
    "search_quotes",
    {
      title: "Search quotes",
      description: "Search Wikiquote pages.",
      inputSchema: z.object( { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchQuotes(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "page_quotes",
    {
      title: "Page quotes",
      description: "Get quotes from a Wikiquote page.",
      inputSchema: z.object( { page: z.string().describe("Page title."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await pageQuotes(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
