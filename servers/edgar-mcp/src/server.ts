import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { companyFacts } from "./api.js"
import { companyFilings } from "./api.js"
import { searchFilings } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "edgar-mcp", version: "1.0.0" })
  server.tool("get_company_filings", "Get the most recent SEC filings for a company by ticker or CIK.", { ticker: z.string().describe("Stock ticker like AAPL or a CIK number.") }, async (args) => {
    try { return text(await companyFilings(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("get_company_facts", "Get XBRL company facts such as revenue and assets for a company.", { ticker: z.string().describe("Stock ticker like TSLA or a CIK number.") }, async (args) => {
    try { return text(await companyFacts(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search_filings", "Full text search across recent SEC filings.", { query: z.string().describe("Search terms like insider trading or merger."), limit: z.number().describe("Max results to return.").optional() }, async (args) => {
    try { return text(await searchFilings(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
