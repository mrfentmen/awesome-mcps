import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  AudiusError,
  formatTrack,
  formatUser,
  getUserTracks,
  searchTracks,
  searchUsers,
  trendingTracks,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "audius-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "trending_tracks",
    {
      title: "Trending tracks",
      description: "Trending tracks on Audius — underground/independent music that isn't " +
      "on the mainstream charts. Filter by genre.",
      inputSchema: z.object(
    {
      genre: z.string().default("all").describe("Genre filter. Use exact Audius genre values, e.g. 'Hip-Hop/Rap', 'Electronic', 'Dubstep', 'Trap', or 'all' for every genre"),
      limit: z.number().int().min(1).max(25).default(8),
    }),
      annotations: READ_ONLY,
    },
    async ({ genre, limit }) => {
      try {
        const tracks = await trendingTracks(genre, limit)
        if (tracks.length === 0) return text(`No trending tracks${genre !== "all" ? ` in ${genre}` : ""}.`)
        return text(
          `Trending${genre !== "all" ? ` ${genre}` : ""} on Audius:\n\n` +
            tracks.map((t, i) => formatTrack(t, i)).join("\n\n")
        )
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "search_tracks",
    {
      title: "Search tracks",
      description: "Search tracks by title/artist keyword.",
      inputSchema: z.object(
    { query: z.string().describe("Search terms"), limit: z.number().int().min(1).max(25).default(8) }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => {
      try {
        const tracks = await searchTracks(query, limit)
        if (tracks.length === 0) return text(`No tracks match "${query}".`)
        return text(`Tracks matching "${query}":\n\n${tracks.map((t, i) => formatTrack(t, i)).join("\n\n")}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "search_artists",
    {
      title: "Search artists",
      description: "Search artists by handle or name.",
      inputSchema: z.object(
    { query: z.string().describe("Artist name or handle"), limit: z.number().int().min(1).max(25).default(8) }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => {
      try {
        const users = await searchUsers(query, limit)
        if (users.length === 0) return text(`No artists match "${query}".`)
        return text(`Artists matching "${query}":\n\n${users.map((u, i) => formatUser(u, i)).join("\n\n")}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_artist_tracks",
    {
      title: "Get artist tracks",
      description: "Get an artist's uploaded tracks by user id.",
      inputSchema: z.object(
    { userId: z.string().describe("User id from search_artists"), limit: z.number().int().min(1).max(25).default(8) }),
      annotations: READ_ONLY,
    },
    async ({ userId, limit }) => {
      try {
        const tracks = await getUserTracks(userId, limit)
        if (tracks.length === 0) return text(`No tracks for user ${userId}.`)
        return text(`Tracks from user ${userId}:\n\n${tracks.map((t, i) => formatTrack(t, i)).join("\n\n")}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof AudiusError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
