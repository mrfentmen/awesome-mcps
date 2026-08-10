import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { article } from "./api.js"
import { articles } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "spaceflight-news-mcp", version: "1.0.0" })
  server.tool("articles", "Latest space news articles.", { limit: z.number().describe("Max results.").optional(), search: z.string().describe("Optional search terms.").optional() }, async (args) => {
    try { return text(await articles(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("article", "One article by ID.", { id: z.number().describe("Article ID.") }, async (args) => {
    try { return text(await article(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
