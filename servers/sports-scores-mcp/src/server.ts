import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { mlbScores } from "./api.js"
import { nbaScores } from "./api.js"
import { nflScores } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "sports-scores-mcp", version: "1.0.0" })
  server.tool("nba_scores", "Today NBA scores and game states.", { limit: z.number().describe("Max games.").optional() }, async (args) => {
    try { return text(await nbaScores(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("nfl_scores", "Today NFL scores and game states.", { limit: z.number().describe("Max games.").optional() }, async (args) => {
    try { return text(await nflScores(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("mlb_scores", "Today MLB scores and game states.", { limit: z.number().describe("Max games.").optional() }, async (args) => {
    try { return text(await mlbScores(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
