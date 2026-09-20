import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { metar } from "./api.js"
import { taf } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "aviation-weather-mcp", version: "1.0.0" })
  server.registerTool(
    "metar",
    {
      title: "Metar",
      description: "METAR report for airports.",
      inputSchema: z.object( { stations: z.string().describe("Comma separated ICAO codes like KJFK,KLAX.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await metar(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "taf",
    {
      title: "Taf",
      description: "TAF forecast for airports.",
      inputSchema: z.object( { stations: z.string().describe("Comma separated ICAO codes.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await taf(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
