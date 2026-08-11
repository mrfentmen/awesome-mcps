import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_search, m1_byCity, m1_byState, m1_search } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'openbrewery-mcp', version: '1.0.0' })
server.tool("search", "Search breweries by name or city.", { query: z.string().describe("Search terms.").optional(), city: z.string().describe("City name.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_search(args)) } catch (e) { return text(error(e)) }
  })
server.tool("by_city", "List breweries in a city.", { city: z.string().describe("City name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_byCity(args)) } catch (e) { return text(error(e)) }
  })
server.tool("by_state", "List breweries in a state.", { state: z.string().describe("State name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_byState(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
