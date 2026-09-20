import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_next, m0_stops, m1_nextArrivals, m1_transitView } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'septa-mcp', version: '1.0.0' })
server.registerTool(
    "next",
    {
      title: "Next",
      description: "Next arrivals between two stations.",
      inputSchema: z.object( { from: z.string().describe("Origin station."), to: z.string().describe("Destination station."), count: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_next(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "stops",
    {
      title: "Stops",
      description: "Stops for a route.",
      inputSchema: z.object( { route: z.string().describe("Route id.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_stops(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "get_next_arrivals",
    {
      title: "Get next arrivals",
      description: "Get next train arrivals between two SEPTA stations.",
      inputSchema: z.object( { origin: z.string().describe("Origin station."), destination: z.string().describe("Destination station.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_nextArrivals(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "get_transit_view",
    {
      title: "Get transit view",
      description: "Get live SEPTA vehicle positions for a route.",
      inputSchema: z.object( { route: z.string().describe("Route id.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_transitView(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
