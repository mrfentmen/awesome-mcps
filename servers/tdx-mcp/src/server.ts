import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  listTraStations,
  getTraLiveboard,
  listThsrStations,
  getTraTimetable,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "tdx-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "list_tra_stations",
    {
      title: "List TRA stations",
      description: "Taiwan Railway stations with ids, names, coordinates for live boards.",
      inputSchema: z.object({
      }),
      annotations: READ_ONLY,
    },
    async ({  }) => {
      try {
        return text(await listTraStations());
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_tra_liveboard",
    {
      title: "Get TRA live board",
      description: "Live Taiwan Railway departures and arrivals for a station.",
      inputSchema: z.object({
        stationId: z.string().describe("Station id from list_tra_stations"),
      }),
      annotations: READ_ONLY,
    },
    async ({ stationId }) => {
      try {
        return text(await getTraLiveboard(stationId));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "list_thsr_stations",
    {
      title: "List THSR stations",
      description: "Taiwan High Speed Rail stations with ids and addresses.",
      inputSchema: z.object({
      }),
      annotations: READ_ONLY,
    },
    async ({  }) => {
      try {
        return text(await listThsrStations());
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_tra_timetable",
    {
      title: "Get TRA timetable",
      description: "Taiwan Railway daily timetable for a station on a date.",
      inputSchema: z.object({
        stationId: z.string().describe("Station id"),
        date: z.string().describe("Date YYYY-MM-DD"),
      }),
      annotations: READ_ONLY,
    },
    async ({ stationId, date }) => {
      try {
        return text(await getTraTimetable(stationId, date));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}
