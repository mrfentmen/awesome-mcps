import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { format, gauges, streamflow, WaterError } from "./api.js"
const text = (s: string) => ({ content: [{ type: "text" as const, text: s }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
export function createServer() { const server = new McpServer({ name: "usgs-water-mcp", version: "1.0.0" }); server.registerTool(
    "get_streamflow",
    {
      title: "Get streamflow",
      description: "Get USGS instantaneous water observations for one gauge.",
      inputSchema: z.object( { site: z.string().min(1), parameter: z.string().default("00060").describe("USGS parameter code, 00060 is discharge"), start: z.string().optional(), end: z.string().optional() }),
      annotations: READ_ONLY,
    },
    async ({ site, parameter, start, end }) => { try { return text(format(await streamflow(site, parameter, start, end))) } catch (e) { return textError(`Error: ${e instanceof Error ? e.message : String(e)}`) } }
  ); server.registerTool(
    "find_gauges",
    {
      title: "Find gauges",
      description: "Find active USGS stream gauges in a longitude,latitude bounding box.",
      inputSchema: z.object( { bbox: z.string().describe("min longitude,min latitude,max longitude,max latitude"), limit: z.number().int().min(1).max(50).default(20) }),
      annotations: READ_ONLY,
    },
    async ({ bbox, limit }) => { try { return text(format(await gauges(bbox, limit))) } catch (e) { return textError(`Error: ${e instanceof Error ? e.message : String(e)}`) } }
  ); return server }
export { WaterError }
