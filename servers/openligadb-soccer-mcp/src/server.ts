import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { matches } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "openligadb-soccer-mcp", version: "1.0.0" })
  server.tool("matches", "Matches for a league and season.", { league: z.string().describe("League like bl1.").optional(), season: z.number().describe("Season year.").optional() }, async (args) => {
    try { return text(await matches(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
