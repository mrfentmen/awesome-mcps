import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_search, m1_clinicalTrials, m1_pubmed, m1_trial } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'clinicaltrials-mcp', version: '1.0.0' })
server.registerTool(
    "search",
    {
      title: "Search",
      description: "Search clinical trials.",
      inputSchema: z.object( { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_search(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "search_clinical_trials",
    {
      title: "Search clinical trials",
      description: "Search clinical trials by condition or keyword.",
      inputSchema: z.object( { query: z.string().describe("Condition or keyword like diabetes."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_clinicalTrials(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "get_trial",
    {
      title: "Get trial",
      description: "Get one clinical trial by NCT id.",
      inputSchema: z.object( { nct_id: z.string().describe("NCT id like NCT00000123.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_trial(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "search_pubmed",
    {
      title: "Search pubmed",
      description: "Search PubMed research articles.",
      inputSchema: z.object( { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_pubmed(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
