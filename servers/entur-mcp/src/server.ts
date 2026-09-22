import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  autocompleteStop,
  reverseGeocode,
  getDepartures,
  planTrip,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const NON_READ_ONLY = { openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "entur-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "autocomplete_stop",
    {
      title: "Autocomplete stops",
      description: "Find Norwegian stops and stations by name: Oslo S, Bergen, Trondheim S.",
      inputSchema: z.object({
        query: z.string().describe("Stop name search"),
        lang: z.string().default("en").describe("Language"),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, lang }) => {
      try {
        return text(await autocompleteStop(query, lang));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "reverse_geocode",
    {
      title: "Reverse geocode",
      description: "Nearest Norwegian stops and addresses for coordinates.",
      inputSchema: z.object({
        latitude: z.number().describe("Latitude"),
        longitude: z.number().describe("Longitude"),
        lang: z.string().default("en").describe("Language"),
      }),
      annotations: READ_ONLY,
    },
    async ({ latitude, longitude, lang }) => {
      try {
        return text(await reverseGeocode(latitude, longitude, lang));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_departures",
    {
      title: "Get departures",
      description: "Live departures from a Norwegian stop place: lines, destinations, realtime times.",
      inputSchema: z.object({
        stopPlaceId: z.string().describe("Stop id like 'NSR:StopPlace:59872' (Oslo S)"),
        departures: z.number().default(5).describe("How many departures"),
      }),
      annotations: READ_ONLY,
    },
    async ({ stopPlaceId, departures }) => {
      try {
        return text(await getDepartures(stopPlaceId, departures));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "plan_trip",
    {
      title: "Plan a trip",
      description: "Door-to-door Norway trip: trains, buses, trams, ferries with legs, times and lines.",
      inputSchema: z.object({
        from: z.string().describe("Origin stop id or 'lat,lon'"),
        to: z.string().describe("Destination stop id or 'lat,lon'"),
        dateTime: z.string().optional().describe("ISO departure time, default now"),
      }),
      annotations: READ_ONLY,
    },
    async ({ from, to, dateTime }) => {
      try {
        return text(await planTrip(from, to, dateTime));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}
