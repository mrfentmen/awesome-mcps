import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { uvForecast } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "uv-index-mcp", version: "1.0.0" })
  server.tool("uv_forecast", "Get the daily UV index forecast for coordinates.", { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude."), days: z.number().describe("Days ahead.").optional() }, async (args) => {
    try { return text(await uvForecast(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
