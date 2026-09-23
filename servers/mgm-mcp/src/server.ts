import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  errorMessage,
  listProvinces,
  listDistricts,
  getDaily,
  getHourly,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "mgm-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "list_provinces",
    {
      title: "List provinces",
      description: "All Turkish provinces with center ids from MGM.",
      inputSchema: z.object({
      }),
      annotations: READ_ONLY,
    },
    async ({  }) => {
      try {
        return text(await listProvinces());
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "list_districts",
    {
      title: "List districts",
      description: "Districts of a province with station ids for forecasts (gunlukTahminIstNo) and current conditions (sondurumIstNo).",
      inputSchema: z.object({
        il: z.string().describe("Province, e.g. 'Ankara', 'Istanbul'"),
      }),
      annotations: READ_ONLY,
    },
    async ({ il }) => {
      try {
        return text(await listDistricts(il));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_daily",
    {
      title: "Get daily forecast",
      description: "MGM multi-day forecast for a station. Use gunlukTahminIstNo from list_districts.",
      inputSchema: z.object({
        istno: z.string().describe("Forecast station id"),
      }),
      annotations: READ_ONLY,
    },
    async ({ istno }) => {
      try {
        return text(await getDaily(istno));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  server.registerTool(
    "get_hourly",
    {
      title: "Get hourly forecast",
      description: "MGM hourly forecast steps for a station.",
      inputSchema: z.object({
        istno: z.string().describe("Forecast station id"),
      }),
      annotations: READ_ONLY,
    },
    async ({ istno }) => {
      try {
        return text(await getHourly(istno));
      } catch (e) {
        return textError(errorMessage(e));
      }
    }
  )

  return server
}
