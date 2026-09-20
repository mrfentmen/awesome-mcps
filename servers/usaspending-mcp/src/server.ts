import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_agencies, m0_searchAwards, m1_federalAwards, m1_nonprofits } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'usaspending-mcp', version: '1.0.0' })
server.registerTool(
    "agencies",
    {
      title: "Agencies",
      description: "Top tier federal agencies.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_agencies(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "search_awards",
    {
      title: "Search awards",
      description: "Search federal awards by keyword.",
      inputSchema: z.object( { keyword: z.string().describe("Award keyword."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_searchAwards(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "search_federal_awards",
    {
      title: "Search federal awards",
      description: "Search federal contract awards by keyword.",
      inputSchema: z.object( { query: z.string().describe("Keyword like cybersecurity or construction."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_federalAwards(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "search_nonprofits",
    {
      title: "Search nonprofits",
      description: "Search nonprofit organizations and their filings.",
      inputSchema: z.object( { query: z.string().describe("Organization name or EIN."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_nonprofits(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
