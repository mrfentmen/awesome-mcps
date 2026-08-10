import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { area } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "opensky-mcp", version: "1.0.0" })
  server.tool("area", "Flights in a bounding box.", { minLat: z.number().describe("Min latitude."), minLon: z.number().describe("Min longitude."), maxLat: z.number().describe("Max latitude."), maxLon: z.number().describe("Max longitude."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await area(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
