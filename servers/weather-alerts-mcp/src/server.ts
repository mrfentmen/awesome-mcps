import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { activeAlerts } from "./api.js"
import { alertsForPoint } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "weather-alerts-mcp", version: "1.0.0" })
  server.tool("active_alerts", "List active weather alerts for a state.", { state: z.string().describe("Two letter state code like CA.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await activeAlerts(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("alerts_for_point", "Active alerts near a location.", { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude.") }, async (args) => {
    try { return text(await alertsForPoint(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
