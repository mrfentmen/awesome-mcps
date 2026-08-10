import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { elevation } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "elevation-mcp", version: "1.0.0" })
  server.tool("elevation", "Get the elevation for coordinates.", { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude.") }, async (args) => {
    try { return text(await elevation(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
