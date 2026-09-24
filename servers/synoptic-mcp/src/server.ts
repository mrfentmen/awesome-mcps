import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  findStations,
  getTimeseries,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "synoptic-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "find_stations",
    {
      title: "Find stations",
      description: "Synoptic weather stations by state with ids, names and coordinates.",
      inputSchema: z.object({
        state: z.string().describe("Two-letter state, e.g. 'TX'"),
        limit: z.number().default(20).describe("How many"),
      }),
      annotations: READ_ONLY,
    },
    async ({ state, limit }) => {
      try {
        return text(await findStations(state, limit));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_timeseries",
    {
      title: "Get time series",
      description: "Observations for stations: temp, wind, humidity and more.",
      inputSchema: z.object({
        stid: z.string().describe("Station id(s), comma-separated"),
        vars: z.string().default("air_temp").describe("Variables like air_temp,wind_speed"),
        recent: z.number().default(60).describe("Minutes back"),
      }),
      annotations: READ_ONLY,
    },
    async ({ stid, vars, recent }) => {
      try {
        return text(await getTimeseries(stid, vars, recent));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}
