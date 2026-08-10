import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { adverseEvents } from "./api.js"
import { approvedDrugs } from "./api.js"
import { drugRecalls } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "openfda-mcp", version: "1.0.0" })
  server.tool("get_drug_recalls", "Get recent FDA drug recalls, optionally filtered by product or reason.", { search: z.string().describe("Optional search terms like salmonella.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await drugRecalls(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search_adverse_events", "Search FDA adverse event reports by drug name.", { drug: z.string().describe("Drug name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await adverseEvents(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search_approved_drugs", "Search approved drug applications.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await approvedDrugs(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
