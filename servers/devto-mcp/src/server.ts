import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { latestArticles } from "./api.js"
import { searchArticles } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "devto-mcp", version: "1.0.0" })
  server.registerTool(
    "latest_articles",
    {
      title: "Latest articles",
      description: "The latest articles on dev.to.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await latestArticles(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "search_articles",
    {
      title: "Search articles",
      description: "Search dev.to articles.",
      inputSchema: z.object( { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchArticles(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
