import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  getDepartures,
  searchStations,
  planJourney,
  getDisruptions,
  getFares,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "ns-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "get_departures",
    {
      title: "Get departures",
      description: "Live NS departures from a station: times, platforms, train types, disruptions. Station codes like UT (Utrecht), ASD (Amsterdam).",
      inputSchema: z.object({
        station: z.string().describe("Station code, e.g. 'UT', 'ASD', 'RTD'"),
        maxJourneys: z.number().default(10).describe("How many departures"),
      }),
      annotations: READ_ONLY,
    },
    async ({ station, maxJourneys }) => {
      try {
        return text(await getDepartures(station, maxJourneys));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "search_stations",
    {
      title: "Search stations",
      description: "Find NS stations by name or code: UIC codes, coordinates, synonyms.",
      inputSchema: z.object({
        query: z.string().describe("Station name or code search"),
      }),
      annotations: READ_ONLY,
    },
    async ({ query }) => {
      try {
        return text(await searchStations(query));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "plan_journey",
    {
      title: "Plan a journey",
      description: "NS door-to-door journey advice: transfers, platforms, fares, disruptions between stations.",
      inputSchema: z.object({
        fromStation: z.string().describe("Origin code, e.g. 'ASD'"),
        toStation: z.string().describe("Destination code, e.g. 'UT'"),
        dateTime: z.string().optional().describe("ISO departure time, default now"),
      }),
      annotations: READ_ONLY,
    },
    async ({ fromStation, toStation, dateTime }) => {
      try {
        return text(await planJourney(fromStation, toStation, dateTime));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_disruptions",
    {
      title: "Get disruptions",
      description: "Current NS disruptions and engineering works with affected routes and alternative advice.",
      inputSchema: z.object({
        isActive: z.boolean().default(true).describe("Only active disruptions"),
      }),
      annotations: READ_ONLY,
    },
    async ({ isActive }) => {
      try {
        return text(await getDisruptions(isActive));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_fares",
    {
      title: "Get fares",
      description: "NS fares between two stations: single, return, discount options.",
      inputSchema: z.object({
        fromStation: z.string().describe("Origin code"),
        toStation: z.string().describe("Destination code"),
      }),
      annotations: READ_ONLY,
    },
    async ({ fromStation, toStation }) => {
      try {
        return text(await getFares(fromStation, toStation));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}
