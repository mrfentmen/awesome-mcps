import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { getCase } from "./api.js"
import { searchCases } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "court-records-mcp", version: "1.0.0" })
  server.tool("search_cases", "Search published court opinions by keyword.", { query: z.string().describe("Search terms."), page_size: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchCases(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("get_case", "Get a single court opinion by CourtListener opinion id.", { case_id: z.number().describe("CourtListener opinion id.") }, async (args) => {
    try { return text(await getCase(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
