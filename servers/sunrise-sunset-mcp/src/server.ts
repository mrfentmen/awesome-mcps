import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { sunTimes } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "sunrise-sunset-mcp", version: "1.0.0" })
  server.tool("sun_times", "Get sunrise and sunset times for a location and date.", { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude."), date: z.string().describe("Date in YYYY-MM-DD format.").optional() }, async (args) => {
    try { return text(await sunTimes(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
