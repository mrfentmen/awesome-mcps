import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_area, m1_flightsInBox, m1_flightsNear } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'opensky-mcp', version: '1.0.0' })
server.tool("area", "Flights in a bounding box.", { minLat: z.number().describe("Min latitude."), minLon: z.number().describe("Min longitude."), maxLat: z.number().describe("Max latitude."), maxLon: z.number().describe("Max longitude."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_area(args)) } catch (e) { return text(error(e)) }
  })
server.tool("flights_near", "Find aircraft within a radius of a location.", { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude."), radius_km: z.number().describe("Radius in kilometers.").optional() }, async (args) => {
    try { return text(await m1_flightsNear(args)) } catch (e) { return text(error(e)) }
  })
server.tool("flights_in_box", "Find aircraft inside a latitude longitude box.", { min_lat: z.number().describe("Minimum latitude."), min_lon: z.number().describe("Minimum longitude."), max_lat: z.number().describe("Maximum latitude."), max_lon: z.number().describe("Maximum longitude."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_flightsInBox(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
