import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatShow, imdbOf, searchShows, TraktError, trendingMovies, trendingShows } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "trakt-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_shows",
    {
      title: "Search shows",
      description: "TV shows by title with years and IMDb links.",
      inputSchema: z.object({
        query: z.string().describe("Show title, e.g. 'Severance'"),
        limit: z.number().int().min(1).max(50).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => {
      try {
        const rows = await searchShows(query, limit)
        if (rows.length === 0) return text(`No shows for "${query}".`)
        return text(rows.map((s, i) => formatShow(s, imdbOf(s.ids), i)).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "trending_shows",
    {
      title: "Trending shows",
      description: "Shows trending on Trakt right now.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(100).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ limit }) => {
      try {
        const rows = await trendingShows(limit)
        if (rows.length === 0) return text("Nothing trending.")
        return text(rows.map((s, i) => formatShow(s, imdbOf(s.ids), i)).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "trending_movies",
    {
      title: "Trending movies",
      description: "Movies trending on Trakt right now.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(100).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ limit }) => {
      try {
        const rows = await trendingMovies(limit)
        if (rows.length === 0) return text("Nothing trending.")
        return text(rows.map((s, i) => formatShow(s, imdbOf(s.ids), i)).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof TraktError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
