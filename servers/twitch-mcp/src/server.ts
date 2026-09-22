import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatStream, formatUser, getUser, topGames, topStreams, TwitchError } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "twitch-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "top_games",
    {
      title: "Top games",
      description: "Most-watched game categories on Twitch right now.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(100).default(10),
      }),
      annotations: READ_ONLY,
    },
    async ({ limit }) => {
      try {
        const rows = await topGames(limit)
        if (rows.length === 0) return text("No games right now.")
        return text(rows.map((g, i) => `${i + 1}. [${g.id}] ${g.name}`).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "top_streams",
    {
      title: "Top live streams",
      description: "Most-watched live streams, optionally for one game id.",
      inputSchema: z.object({
        game_id: z.string().default("").describe("Game id from top_games, empty = all"),
        limit: z.number().int().min(1).max(100).default(10),
      }),
      annotations: READ_ONLY,
    },
    async ({ game_id, limit }) => {
      try {
        const rows = await topStreams(game_id, limit)
        if (rows.length === 0) return text("No live streams right now.")
        return text(rows.map((s, i) => formatStream(s, i)).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_user",
    {
      title: "Get user",
      description: "A Twitch user: id, display name, broadcaster type, bio.",
      inputSchema: z.object({
        login: z.string().describe("Login name, e.g. 'shroud'"),
      }),
      annotations: READ_ONLY,
    },
    async ({ login }) => {
      try {
        const u = await getUser(login)
        if (!u) return text(`No Twitch user "${login}".`)
        return text(formatUser(u))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof TwitchError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
