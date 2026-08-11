import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_reverse, m0_search, m1_geocode, m1_reverse } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'nominatim-mcp', version: '1.0.0' })
server.tool("search", "Search places by name.", { query: z.string().describe("Place name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_search(args)) } catch (e) { return text(error(e)) }
  })
server.tool("reverse", "Address for coordinates.", { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude.") }, async (args) => {
    try { return text(await m0_reverse(args)) } catch (e) { return text(error(e)) }
  })
server.tool("geocode", "Find coordinates for a place name or address.", { query: z.string().describe("Place or address."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_geocode(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
