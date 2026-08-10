import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { issNow } from "./api.js"
import { issPasses } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "iss-mcp", version: "1.0.0" })
  server.tool("iss_now", "Current ISS position, altitude, and velocity.", {  }, async (args) => {
    try { return text(await issNow(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("iss_passes", "Upcoming ISS passes over a location.", { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude."), days: z.number().describe("Days to look ahead.").optional() }, async (args) => {
    try { return text(await issPasses(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
