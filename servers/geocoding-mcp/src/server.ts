import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { geocode } from "./api.js"
import { reverse } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "geocoding-mcp", version: "1.0.0" })
  server.tool("geocode", "Find coordinates for a place name or address.", { query: z.string().describe("Place or address."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await geocode(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("reverse", "Find the address for coordinates.", { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude.") }, async (args) => {
    try { return text(await reverse(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
