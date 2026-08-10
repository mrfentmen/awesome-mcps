import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { flightsInBox } from "./api.js"
import { flightsNear } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "flights-mcp", version: "1.0.0" })
  server.tool("flights_near", "Find aircraft within a radius of a location.", { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude."), radius_km: z.number().describe("Radius in kilometers.").optional() }, async (args) => {
    try { return text(await flightsNear(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("flights_in_box", "Find aircraft inside a latitude longitude box.", { min_lat: z.number().describe("Minimum latitude."), min_lon: z.number().describe("Minimum longitude."), max_lat: z.number().describe("Maximum latitude."), max_lon: z.number().describe("Maximum longitude."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await flightsInBox(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
