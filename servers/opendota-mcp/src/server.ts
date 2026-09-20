import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { heroStats } from "./api.js"
import { heroes } from "./api.js"
import { match } from "./api.js"
import { player } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "opendota-mcp", version: "1.0.0" })
  server.registerTool(
    "heroes",
    {
      title: "Heroes",
      description: "List Dota 2 heroes.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await heroes(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "hero_stats",
    {
      title: "Hero stats",
      description: "Hero win rates and pick rates.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await heroStats(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "match",
    {
      title: "Match",
      description: "Details for one match.",
      inputSchema: z.object( { matchId: z.number().describe("Match ID.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await match(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "player",
    {
      title: "Player",
      description: "Summary for one player.",
      inputSchema: z.object( { accountId: z.number().describe("Steam account ID.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await player(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
