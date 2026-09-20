import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { format, predictions, TidesError, waterLevels } from "./api.js"
const text = (s: string) => ({ content: [{ type: "text" as const, text: s }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
export function createServer() { const server = new McpServer({ name: "tides-mcp", version: "1.0.0" }); server.registerTool(
    "get_tide_predictions",
    {
      title: "Get tide predictions",
      description: "Get NOAA high low or hourly tide predictions for a station and date range.",
      inputSchema: z.object( { station: z.string().min(3), begin: z.string().describe("YYYY-MM-DD"), end: z.string().describe("YYYY-MM-DD"), interval: z.enum(["hilo", "h"]).default("hilo"), units: z.enum(["english", "metric"]).default("english") }),
      annotations: READ_ONLY,
    },
    async ({ station, begin, end, interval, units }) => { try { return text(format(await predictions(station, begin, end, interval, units))) } catch (e) { return textError(`Error: ${e instanceof Error ? e.message : String(e)}`) } }
  ); server.registerTool(
    "get_water_levels",
    {
      title: "Get water levels",
      description: "Get observed NOAA water levels for a station and short date range.",
      inputSchema: z.object( { station: z.string().min(3), begin: z.string(), end: z.string(), interval: z.enum(["6", "h"]).default("6"), units: z.enum(["english", "metric"]).default("english") }),
      annotations: READ_ONLY,
    },
    async ({ station, begin, end, interval, units }) => { try { return text(format(await waterLevels(station, begin, end, interval, units))) } catch (e) { return textError(`Error: ${e instanceof Error ? e.message : String(e)}`) } }
  ); return server }
export { TidesError }
