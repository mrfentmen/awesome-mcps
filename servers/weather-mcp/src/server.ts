import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_earthquakes, m0_femaDisasters, m0_forecast, m1_activeAlerts, m1_alertsForPoint } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'weather-mcp', version: '1.0.0' })
server.tool("get_forecast", "Get the National Weather Service forecast for coordinates.", { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude.") }, async (args) => {
    try { return text(await m0_forecast(args)) } catch (e) { return text(error(e)) }
  })
server.tool("get_earthquakes", "Get recent earthquakes from USGS.", { days: z.number().describe("1 for the day, 7 for the week.").optional() }, async (args) => {
    try { return text(await m0_earthquakes(args)) } catch (e) { return text(error(e)) }
  })
server.tool("get_fema_disasters", "Get recent FEMA disaster declarations.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_femaDisasters(args)) } catch (e) { return text(error(e)) }
  })
server.tool("active_alerts", "List active weather alerts for a state.", { state: z.string().describe("Two letter state code like CA.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_activeAlerts(args)) } catch (e) { return text(error(e)) }
  })
server.tool("alerts_for_point", "Active alerts near a location.", { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude.") }, async (args) => {
    try { return text(await m1_alertsForPoint(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
