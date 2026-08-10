import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { byPlace } from "./api.js"
import { recent } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "earthquake-mcp", version: "1.0.0" })
  server.tool("recent", "Recent earthquakes in a time window.", { days: z.number().describe("1, 7, or 30.").optional(), min_mag: z.number().describe("Minimum magnitude.").optional(), limit: z.number().describe("Maximum results.").optional() }, async (args) => {
    try { return text(await recent(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("byPlace", "Earthquakes near a place name.", { place: z.string().describe("Place keyword, for example California."), limit: z.number().describe("Maximum results.").optional() }, async (args) => {
    try { return text(await byPlace(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
