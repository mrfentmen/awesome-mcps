import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { forecast } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "marine-forecast-mcp", version: "1.0.0" })
  server.tool("forecast", "Marine forecast for a location.", { latitude: z.number().describe("Latitude."), longitude: z.number().describe("Longitude."), days: z.number().describe("Forecast days.").optional() }, async (args) => {
    try { return text(await forecast(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
