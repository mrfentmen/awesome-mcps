import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { latestArticles } from "./api.js"
import { searchArticles } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "devto-mcp", version: "1.0.0" })
  server.tool("latest_articles", "The latest articles on dev.to.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await latestArticles(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search_articles", "Search dev.to articles.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchArticles(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
