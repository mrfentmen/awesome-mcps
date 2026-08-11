import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { find } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "fcc-mcp", version: "1.0.0" })
  server.tool("find", "Find census block for coordinates.", { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude.") }, async (args) => {
    try { return text(await find(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
