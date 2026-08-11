import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { coordinates } from "./api.js"
import { geocode } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "census-geo-mcp", version: "1.0.0" })
  server.tool("geocode", "Geocode a street address.", { address: z.string().describe("Street address.") }, async (args) => {
    try { return text(await geocode(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("coordinates", "Reverse geocode coordinates.", { x: z.number().describe("Longitude."), y: z.number().describe("Latitude.") }, async (args) => {
    try { return text(await coordinates(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
