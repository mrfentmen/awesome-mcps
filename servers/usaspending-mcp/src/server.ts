import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_agencies, m0_searchAwards, m1_federalAwards, m1_nonprofits } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'usaspending-mcp', version: '1.0.0' })
server.tool("agencies", "Top tier federal agencies.", {  }, async (args) => {
    try { return text(await m0_agencies(args)) } catch (e) { return text(error(e)) }
  })
server.tool("search_awards", "Search federal awards by keyword.", { keyword: z.string().describe("Award keyword."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_searchAwards(args)) } catch (e) { return text(error(e)) }
  })
server.tool("search_federal_awards", "Search federal contract awards by keyword.", { query: z.string().describe("Keyword like cybersecurity or construction."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_federalAwards(args)) } catch (e) { return text(error(e)) }
  })
server.tool("search_nonprofits", "Search nonprofit organizations and their filings.", { query: z.string().describe("Organization name or EIN."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_nonprofits(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
