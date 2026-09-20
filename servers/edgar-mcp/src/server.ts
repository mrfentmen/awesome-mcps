import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { companyFacts } from "./api.js"
import { companyFilings } from "./api.js"
import { searchFilings } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "edgar-mcp", version: "1.0.0" })
  server.registerTool(
    "get_company_filings",
    {
      title: "Get company filings",
      description: "Get the most recent SEC filings for a company by ticker or CIK.",
      inputSchema: z.object( { ticker: z.string().describe("Stock ticker like AAPL or a CIK number.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await companyFilings(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "get_company_facts",
    {
      title: "Get company facts",
      description: "Get XBRL company facts such as revenue and assets for a company.",
      inputSchema: z.object( { ticker: z.string().describe("Stock ticker like TSLA or a CIK number.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await companyFacts(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "search_filings",
    {
      title: "Search filings",
      description: "Full text search across recent SEC filings.",
      inputSchema: z.object( { query: z.string().describe("Search terms like insider trading or merger."), limit: z.number().describe("Max results to return.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchFilings(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
