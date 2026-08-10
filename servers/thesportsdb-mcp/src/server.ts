import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { league } from "./api.js"
import { team } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "thesportsdb-mcp", version: "1.0.0" })
  server.tool("team", "Search teams.", { query: z.string().describe("Team name.") }, async (args) => {
    try { return text(await team(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("league", "Upcoming events for a league.", { id: z.number().describe("League id."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await league(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
