import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { heroStats } from "./api.js"
import { heroes } from "./api.js"
import { match } from "./api.js"
import { player } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "opendota-mcp", version: "1.0.0" })
  server.tool("heroes", "List Dota 2 heroes.", {  }, async (args) => {
    try { return text(await heroes(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("hero_stats", "Hero win rates and pick rates.", {  }, async (args) => {
    try { return text(await heroStats(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("match", "Details for one match.", { matchId: z.number().describe("Match ID.") }, async (args) => {
    try { return text(await match(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("player", "Summary for one player.", { accountId: z.number().describe("Steam account ID.") }, async (args) => {
    try { return text(await player(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
