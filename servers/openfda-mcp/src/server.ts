import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_adverseEvents, m0_approvedDrugs, m0_drugRecalls, m1_events } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'openfda-mcp', version: '1.0.0' })
server.tool("get_drug_recalls", "Get recent FDA drug recalls, optionally filtered by product or reason.", { search: z.string().describe("Optional search terms like salmonella.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_drugRecalls(args)) } catch (e) { return text(error(e)) }
  })
server.tool("search_adverse_events", "Search FDA adverse event reports by drug name.", { drug: z.string().describe("Drug name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_adverseEvents(args)) } catch (e) { return text(error(e)) }
  })
server.tool("search_approved_drugs", "Search approved drug applications.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_approvedDrugs(args)) } catch (e) { return text(error(e)) }
  })
server.tool("events", "Drug adverse event reports for a drug.", { drug: z.string().describe("Brand name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_events(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
