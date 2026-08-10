import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { paperInfo } from "./api.js"
import { searchPapers } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "arxiv-mcp", version: "1.0.0" })
  server.tool("search_papers", "Search arXiv papers.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchPapers(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("paper_info", "Get details for a paper by arXiv ID.", { paperId: z.string().describe("arXiv paper ID like 2301.00001.") }, async (args) => {
    try { return text(await paperInfo(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
