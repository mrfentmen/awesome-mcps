import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_search, m1_appLookup, m1_topFree, m1_topPaid, m2_searchPodcasts, m2_topPodcasts } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'itunes-mcp', version: '1.0.0' })
server.registerTool(
    "search",
    {
      title: "Search",
      description: "Search iTunes media.",
      inputSchema: z.object( { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_search(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "top_free",
    {
      title: "Top free",
      description: "Top free apps in the App Store.",
      inputSchema: z.object( { country: z.string().describe("Two letter country code.").optional(), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_topFree(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "top_paid",
    {
      title: "Top paid",
      description: "Top paid apps in the App Store.",
      inputSchema: z.object( { country: z.string().describe("Two letter country code.").optional(), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_topPaid(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "app_lookup",
    {
      title: "App lookup",
      description: "Get details for an app by its App Store ID.",
      inputSchema: z.object( { appId: z.number().describe("App Store numeric ID.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_appLookup(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "search_podcasts",
    {
      title: "Search podcasts",
      description: "Search podcasts by term.",
      inputSchema: z.object( { query: z.string().describe("Search term."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m2_searchPodcasts(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "top_podcasts",
    {
      title: "Top podcasts",
      description: "Top podcasts in a category.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m2_topPodcasts(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
