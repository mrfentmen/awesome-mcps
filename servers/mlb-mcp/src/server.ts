import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { schedule } from "./api.js"
import { standings } from "./api.js"
import { teams } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "mlb-mcp", version: "1.0.0" })
  server.tool("teams", "All MLB teams.", {  }, async (args) => {
    try { return text(await teams(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("schedule", "Games for a date.", { date: z.string().describe("Date like 2026-08-10."), teamId: z.number().describe("Optional team ID.").optional() }, async (args) => {
    try { return text(await schedule(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("standings", "Standings for a season.", { season: z.number().describe("Season year.").optional() }, async (args) => {
    try { return text(await standings(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
