import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { forecast } from "./api.js"
import { nowcast } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "yr-metno-mcp", version: "1.0.0" })
  server.tool("forecast", "Compact location forecast for a point.", { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude.") }, async (args) => {
    try { return text(await forecast(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("nowcast", "Short-term nowcast for a point.", { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude.") }, async (args) => {
    try { return text(await nowcast(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
