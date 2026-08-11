import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_search, m1_appLookup, m1_topFree, m1_topPaid, m2_searchPodcasts, m2_topPodcasts } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'itunes-mcp', version: '1.0.0' })
server.tool("search", "Search iTunes media.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_search(args)) } catch (e) { return text(error(e)) }
  })
server.tool("top_free", "Top free apps in the App Store.", { country: z.string().describe("Two letter country code.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_topFree(args)) } catch (e) { return text(error(e)) }
  })
server.tool("top_paid", "Top paid apps in the App Store.", { country: z.string().describe("Two letter country code.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_topPaid(args)) } catch (e) { return text(error(e)) }
  })
server.tool("app_lookup", "Get details for an app by its App Store ID.", { appId: z.number().describe("App Store numeric ID.") }, async (args) => {
    try { return text(await m1_appLookup(args)) } catch (e) { return text(error(e)) }
  })
server.tool("search_podcasts", "Search podcasts by term.", { query: z.string().describe("Search term."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m2_searchPodcasts(args)) } catch (e) { return text(error(e)) }
  })
server.tool("top_podcasts", "Top podcasts in a category.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m2_topPodcasts(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
