import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { driverStandings } from "./api.js"
import { lastRace } from "./api.js"
import { seasonSchedule } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "formula1-mcp", version: "1.0.0" })
  server.tool("last_race", "Results from the most recent race.", {  }, async (args) => {
    try { return text(await lastRace(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("driver_standings", "Current driver standings.", {  }, async (args) => {
    try { return text(await driverStandings(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("season_schedule", "The race schedule for a season.", { season: z.number().describe("Season year.").optional() }, async (args) => {
    try { return text(await seasonSchedule(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
