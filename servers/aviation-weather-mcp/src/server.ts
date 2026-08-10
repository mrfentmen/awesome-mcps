import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { metar } from "./api.js"
import { taf } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "aviation-weather-mcp", version: "1.0.0" })
  server.tool("metar", "METAR report for airports.", { stations: z.string().describe("Comma separated ICAO codes like KJFK,KLAX.") }, async (args) => {
    try { return text(await metar(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("taf", "TAF forecast for airports.", { stations: z.string().describe("Comma separated ICAO codes.") }, async (args) => {
    try { return text(await taf(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
