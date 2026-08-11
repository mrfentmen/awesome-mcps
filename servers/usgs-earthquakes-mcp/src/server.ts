import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_recent, m1_byPlace, m1_recent, m2_formatQuake, m2_latestQuakes, m2_queryQuakes, m2_UsgsError } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'usgs-earthquakes-mcp', version: '1.0.0' })
server.tool("recent", "Recent earthquakes in the last day.", { minMagnitude: z.number().describe("Minimum magnitude.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_recent(args)) } catch (e) { return text(error(e)) }
  })
server.tool("byPlace", "Earthquakes near a place name.", { place: z.string().describe("Place keyword, for example California."), limit: z.number().describe("Maximum results.").optional() }, async (args) => {
    try { return text(await m1_byPlace(args)) } catch (e) { return text(error(e)) }
  })
server.tool(
    "latest_quakes",
    "Latest earthquakes from the USGS feed.",
    {
      magnitude: z.enum(["all", "1.0", "2.5", "4.5"]).default("2.5").describe("Minimum magnitude band"),
      timeframe: z.enum(["hour", "day", "week", "month"]).default("day").describe("Lookback window"),
      limit: z.number().int().min(1).max(50).default(15),
    },
    async ({ magnitude, timeframe, limit }) => {
      try {
        const quakes = await m2_latestQuakes(magnitude, timeframe, limit)
        if (quakes.length === 0) return text(`No M${magnitude}+ quakes in the last ${timeframe}.`)
        return text(`Latest M${magnitude}+ earthquakes (${timeframe}):\n\n${quakes.map((q, i) => `${i + 1}. ${m2_formatQuake(q)}`).join("\n\n")}`)
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )
server.tool(
    "query_quakes",
    "Query earthquakes by magnitude, count, and start time.",
    {
      minMagnitude: z.number().min(0).max(10).default(4.5).describe("Minimum magnitude"),
      limit: z.number().int().min(1).max(50).default(10),
      starttime: z.string().optional().describe("Start time, e.g. '2026-08-01'"),
    },
    async ({ minMagnitude, limit, starttime }) => {
      try {
        const quakes = await m2_queryQuakes(minMagnitude, limit, starttime)
        if (quakes.length === 0) return text(`No quakes M${minMagnitude}+${starttime ? ` since ${starttime}` : ""}.`)
        return text(`Quakes M${minMagnitude}+${starttime ? ` since ${starttime}` : ""}:\n\n${quakes.map((q, i) => `${i + 1}. ${m2_formatQuake(q)}`).join("\n\n")}`)
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )
  return server
}
