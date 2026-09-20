import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_current, m0_drivers, m0_races, m1_driverStandings, m1_lastRace, m1_seasonSchedule } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'jolpica-mcp', version: '1.0.0' })
server.registerTool(
    "current",
    {
      title: "Current",
      description: "Current F1 season summary.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_current(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "races",
    {
      title: "Races",
      description: "Races in a season.",
      inputSchema: z.object( { year: z.number().describe("Season year.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_races(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "drivers",
    {
      title: "Drivers",
      description: "Drivers in a season.",
      inputSchema: z.object( { year: z.number().describe("Season year.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_drivers(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "last_race",
    {
      title: "Last race",
      description: "Results from the most recent race.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_lastRace(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "driver_standings",
    {
      title: "Driver standings",
      description: "Current driver standings.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_driverStandings(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "season_schedule",
    {
      title: "Season schedule",
      description: "The race schedule for a season.",
      inputSchema: z.object( { season: z.number().describe("Season year.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_seasonSchedule(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
