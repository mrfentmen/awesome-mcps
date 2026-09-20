import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { paperInfo } from "./api.js"
import { searchPapers } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "arxiv-mcp", version: "1.0.0" })
  server.registerTool(
    "search_papers",
    {
      title: "Search papers",
      description: "Search arXiv papers.",
      inputSchema: z.object( { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchPapers(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "paper_info",
    {
      title: "Paper info",
      description: "Get details for a paper by arXiv ID.",
      inputSchema: z.object( { paperId: z.string().describe("arXiv paper ID like 2301.00001.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await paperInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
