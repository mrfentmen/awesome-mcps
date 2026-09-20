import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { mlbScores } from "./api.js"
import { nbaScores } from "./api.js"
import { nflScores } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "sports-scores-mcp", version: "1.0.0" })
  server.registerTool(
    "nba_scores",
    {
      title: "Nba scores",
      description: "Today NBA scores and game states.",
      inputSchema: z.object( { limit: z.number().describe("Max games.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await nbaScores(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "nfl_scores",
    {
      title: "Nfl scores",
      description: "Today NFL scores and game states.",
      inputSchema: z.object( { limit: z.number().describe("Max games.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await nflScores(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "mlb_scores",
    {
      title: "Mlb scores",
      description: "Today MLB scores and game states.",
      inputSchema: z.object( { limit: z.number().describe("Max games.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await mlbScores(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
