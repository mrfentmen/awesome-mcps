import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { departures } from "./api.js"
import { stops } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "berlin-bvg-mcp", version: "1.0.0" })
  server.tool("stops", "Search stops.", { query: z.string().describe("Stop name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await stops(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("departures", "Departures at a stop.", { id: z.string().describe("Stop id."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await departures(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
