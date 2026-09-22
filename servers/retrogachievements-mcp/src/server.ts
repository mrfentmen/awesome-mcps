import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { gameExtended, RaError, userProgress } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "retrogachievements-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "game_extended",
    {
      title: "Game achievements",
      description: "A retro game with its achievement list. Find ids via rom-mcp.",
      inputSchema: z.object({
        game_id: z.string().describe("Numeric RetroAchievements game id"),
      }),
      annotations: READ_ONLY,
    },
    async ({ game_id }) => {
      try {
        return text(await gameExtended(game_id))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "user_progress",
    {
      title: "User progress",
      description: "A player's points, rank, and recently played games.",
      inputSchema: z.object({
        username: z.string().describe("RetroAchievements username"),
      }),
      annotations: READ_ONLY,
    },
    async ({ username }) => {
      try {
        return text(await userProgress(username))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof RaError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
