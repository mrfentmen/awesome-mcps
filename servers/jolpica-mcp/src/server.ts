import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_current, m0_drivers, m0_races, m1_driverStandings, m1_lastRace, m1_seasonSchedule } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'jolpica-mcp', version: '1.0.0' })
server.tool("current", "Current F1 season summary.", {  }, async (args) => {
    try { return text(await m0_current(args)) } catch (e) { return text(error(e)) }
  })
server.tool("races", "Races in a season.", { year: z.number().describe("Season year.").optional() }, async (args) => {
    try { return text(await m0_races(args)) } catch (e) { return text(error(e)) }
  })
server.tool("drivers", "Drivers in a season.", { year: z.number().describe("Season year.").optional() }, async (args) => {
    try { return text(await m0_drivers(args)) } catch (e) { return text(error(e)) }
  })
server.tool("last_race", "Results from the most recent race.", {  }, async (args) => {
    try { return text(await m1_lastRace(args)) } catch (e) { return text(error(e)) }
  })
server.tool("driver_standings", "Current driver standings.", {  }, async (args) => {
    try { return text(await m1_driverStandings(args)) } catch (e) { return text(error(e)) }
  })
server.tool("season_schedule", "The race schedule for a season.", { season: z.number().describe("Season year.").optional() }, async (args) => {
    try { return text(await m1_seasonSchedule(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
