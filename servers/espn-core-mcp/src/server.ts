import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { athletes } from "./api.js"
import { teams } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "espn-core-mcp", version: "1.0.0" })
  server.tool("teams", "List teams for a league.", { sport: z.string().describe("Sport like football.").optional(), league: z.string().describe("League like nfl.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await teams(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("athletes", "List athletes for a team.", { team: z.string().describe("Team ref id."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await athletes(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
