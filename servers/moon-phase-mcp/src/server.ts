import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { moonOnDate } from "./api.js"
import { moonPhase } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "moon-phase-mcp", version: "1.0.0" })
  server.tool("moon_phase", "Get the current moon phase and illumination.", {  }, async (args) => {
    try { return text(await moonPhase(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("moon_on_date", "Get the moon phase for a date.", { date: z.string().describe("Date in YYYY-MM-DD format.").optional() }, async (args) => {
    try { return text(await moonOnDate(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
