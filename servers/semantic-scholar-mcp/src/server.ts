import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { paperInfo } from "./api.js"
import { searchPapers } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "semantic-scholar-mcp", version: "1.0.0" })
  server.tool("search_papers", "Search academic papers.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchPapers(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("paper_info", "Get details and citation count for a paper.", { paperId: z.string().describe("Semantic Scholar paper ID.") }, async (args) => {
    try { return text(await paperInfo(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
