import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_formatAlerts, m0_formatScales, m0_formatSpeed, m0_SpaceWeatherError, m0_alerts, m0_scales, m0_solarWindSpeed, m1_latest, m1_map, m2_xrays } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'space-weather-mcp', version: '1.0.0' })
server.registerTool(
    "get_solar_wind",
    {
      title: "Get solar wind",
      description: "Get recent NOAA proton solar wind speed readings.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => { try { return text(m0_formatSpeed(await m0_solarWindSpeed())) } catch (e) { return textError(error(e)) } }
  )
server.registerTool(
    "get_noaa_scales",
    {
      title: "Get noaa scales",
      description: "Get NOAA current radio, solar radiation, and geomagnetic scales.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => { try { return text(m0_formatScales(await m0_scales())) } catch (e) { return textError(error(e)) } }
  )
server.registerTool(
    "get_alerts",
    {
      title: "Get alerts",
      description: "Get recent NOAA Space Weather Prediction Center alerts.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => { try { return text(m0_formatAlerts(await m0_alerts())) } catch (e) { return textError(error(e)) } }
  )
server.registerTool(
    "latest",
    {
      title: "Latest",
      description: "Latest aurora observation and forecast time.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_latest(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "map",
    {
      title: "Map",
      description: "Describe the aurora forecast map coverage.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_map(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "xrays",
    {
      title: "Xrays",
      description: "Recent solar x ray flux readings.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m2_xrays(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
