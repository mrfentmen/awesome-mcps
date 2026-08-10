import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { earthquakes } from "./api.js"
import { femaDisasters } from "./api.js"
import { forecast } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "weather-mcp", version: "1.0.0" })
  server.tool("get_forecast", "Get the National Weather Service forecast for coordinates.", { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude.") }, async (args) => {
    try { return text(await forecast(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("get_earthquakes", "Get recent earthquakes from USGS.", { days: z.number().describe("1 for the day, 7 for the week.").optional() }, async (args) => {
    try { return text(await earthquakes(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("get_fema_disasters", "Get recent FEMA disaster declarations.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await femaDisasters(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
