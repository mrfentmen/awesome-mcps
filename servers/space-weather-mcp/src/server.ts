import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_formatAlerts, m0_formatScales, m0_formatSpeed, m0_SpaceWeatherError, m0_alerts, m0_scales, m0_solarWindSpeed, m1_latest, m1_map, m2_xrays } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'space-weather-mcp', version: '1.0.0' })
server.tool("get_solar_wind", "Get recent NOAA proton solar wind speed readings.", {}, async () => { try { return text(m0_formatSpeed(await m0_solarWindSpeed())) } catch (e) { return text(error(e)) } })
server.tool("get_noaa_scales", "Get NOAA current radio, solar radiation, and geomagnetic scales.", {}, async () => { try { return text(m0_formatScales(await m0_scales())) } catch (e) { return text(error(e)) } })
server.tool("get_alerts", "Get recent NOAA Space Weather Prediction Center alerts.", {}, async () => { try { return text(m0_formatAlerts(await m0_alerts())) } catch (e) { return text(error(e)) } })
server.tool("latest", "Latest aurora observation and forecast time.", {  }, async (args) => {
    try { return text(await m1_latest(args)) } catch (e) { return text(error(e)) }
  })
server.tool("map", "Describe the aurora forecast map coverage.", {  }, async (args) => {
    try { return text(await m1_map(args)) } catch (e) { return text(error(e)) }
  })
server.tool("xrays", "Recent solar x ray flux readings.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m2_xrays(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
