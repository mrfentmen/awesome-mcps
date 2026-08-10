import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { nearest } from "./api.js"
import { route } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "osrm-mcp", version: "1.0.0" })
  server.tool("route", "Route between coordinates.", { coordinates: z.string().describe("lon,lat;lon,lat pairs."), profile: z.string().describe("driving, cycling, or walking.").optional() }, async (args) => {
    try { return text(await route(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("nearest", "Nearest road point to a coordinate.", { longitude: z.number().describe("Longitude."), latitude: z.number().describe("Latitude."), profile: z.string().describe("driving, cycling, or walking.").optional() }, async (args) => {
    try { return text(await nearest(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
