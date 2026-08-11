import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_next, m0_stops, m1_nextArrivals, m1_transitView } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'septa-mcp', version: '1.0.0' })
server.tool("next", "Next arrivals between two stations.", { from: z.string().describe("Origin station."), to: z.string().describe("Destination station."), count: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_next(args)) } catch (e) { return text(error(e)) }
  })
server.tool("stops", "Stops for a route.", { route: z.string().describe("Route id.") }, async (args) => {
    try { return text(await m0_stops(args)) } catch (e) { return text(error(e)) }
  })
server.tool("get_next_arrivals", "Get next train arrivals between two SEPTA stations.", { origin: z.string().describe("Origin station."), destination: z.string().describe("Destination station.") }, async (args) => {
    try { return text(await m1_nextArrivals(args)) } catch (e) { return text(error(e)) }
  })
server.tool("get_transit_view", "Get live SEPTA vehicle positions for a route.", { route: z.string().describe("Route id.") }, async (args) => {
    try { return text(await m1_transitView(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
