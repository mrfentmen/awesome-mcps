import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  getDailyForecast,
  getHourlyForecast,
  getObservations,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "bom-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "get_daily_forecast",
    {
      title: "Get daily forecast",
      description: "BOM 7-day daily forecast for coordinates: rain chance, min/max, UV, fire danger.",
      inputSchema: z.object({
        lat: z.number().describe("Latitude"),
        lon: z.number().describe("Longitude"),
      }),
      annotations: READ_ONLY,
    },
    async ({ lat, lon }) => {
      try {
        return text(await getDailyForecast(lat, lon));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_hourly_forecast",
    {
      title: "Get hourly forecast",
      description: "BOM 3-hourly forecast steps for coordinates: temp, rain, wind, humidity.",
      inputSchema: z.object({
        lat: z.number().describe("Latitude"),
        lon: z.number().describe("Longitude"),
      }),
      annotations: READ_ONLY,
    },
    async ({ lat, lon }) => {
      try {
        return text(await getHourlyForecast(lat, lon));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_observations",
    {
      title: "Get station observations",
      description: "Latest BOM station observations: temp, humidity, wind, pressure, rain. Product like IDN60901 (NSW), station like 94768 (Sydney).",
      inputSchema: z.object({
        product: z.string().describe("Product code, e.g. 'IDN60901'"),
        stationId: z.string().describe("Station id, e.g. '94768'"),
      }),
      annotations: READ_ONLY,
    },
    async ({ product, stationId }) => {
      try {
        return text(await getObservations(product, stationId));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}
