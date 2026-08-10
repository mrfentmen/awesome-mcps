import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { federalAwards } from "./api.js"
import { nonprofits } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "procurement-mcp", version: "1.0.0" })
  server.tool("search_federal_awards", "Search federal contract awards by keyword.", { query: z.string().describe("Keyword like cybersecurity or construction."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await federalAwards(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search_nonprofits", "Search nonprofit organizations and their filings.", { query: z.string().describe("Organization name or EIN."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await nonprofits(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
