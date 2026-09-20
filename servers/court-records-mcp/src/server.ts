import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { getCase } from "./api.js"
import { searchCases } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "court-records-mcp", version: "1.0.0" })
  server.registerTool(
    "search_cases",
    {
      title: "Search cases",
      description: "Search published court opinions by keyword.",
      inputSchema: z.object( { query: z.string().describe("Search terms."), page_size: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchCases(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "get_case",
    {
      title: "Get case",
      description: "Get a single court opinion by CourtListener opinion id.",
      inputSchema: z.object( { case_id: z.number().describe("CourtListener opinion id.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await getCase(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
