import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { weather } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "brightsky-mcp", version: "1.0.0" })
  server.tool("weather", "Weather for coordinates.", { lat: z.number().describe("Latitude."), lon: z.number().describe("Longitude."), date: z.string().describe("YYYY-MM-DD.").optional() }, async (args) => {
    try { return text(await weather(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
