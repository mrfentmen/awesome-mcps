import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_area, m1_flightsInBox, m1_flightsNear } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'opensky-mcp', version: '1.0.0' })
server.registerTool(
    "area",
    {
      title: "Area",
      description: "Flights in a bounding box.",
      inputSchema: z.object( { minLat: z.number().describe("Min latitude."), minLon: z.number().describe("Min longitude."), maxLat: z.number().describe("Max latitude."), maxLon: z.number().describe("Max longitude."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_area(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "flights_near",
    {
      title: "Flights near",
      description: "Find aircraft within a radius of a location.",
      inputSchema: z.object( { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude."), radius_km: z.number().describe("Radius in kilometers.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_flightsNear(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "flights_in_box",
    {
      title: "Flights in box",
      description: "Find aircraft inside a latitude longitude box.",
      inputSchema: z.object( { min_lat: z.number().describe("Minimum latitude."), min_lon: z.number().describe("Minimum longitude."), max_lat: z.number().describe("Maximum latitude."), max_lon: z.number().describe("Maximum longitude."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_flightsInBox(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
