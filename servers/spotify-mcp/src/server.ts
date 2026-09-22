import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatAlbum, formatArtist, formatItem, getAlbum, getArtist, searchCatalog, SpotifyError } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "spotify-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search",
    {
      title: "Search catalog",
      description: "Search Spotify albums, artists, tracks.",
      inputSchema: z.object({
        query: z.string().describe("Search text, e.g. 'daft punk'"),
        kind: z.enum(["album", "artist", "track"]).default("track"),
        limit: z.number().int().min(1).max(50).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, kind, limit }) => {
      try {
        const results = await searchCatalog(query, kind, limit)
        if (results.length === 0) return text(`Nothing found for "${query}".`)
        return text(`Spotify ${kind}s for "${query}":\n\n${results.map((it, i) => formatItem(it, i)).join("\n")}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_album",
    {
      title: "Get album",
      description: "One Spotify album: artists, date, tracks, label, link.",
      inputSchema: z.object({
        id: z.string().describe("Spotify album id (use search to find it)"),
      }),
      annotations: READ_ONLY,
    },
    async ({ id }) => {
      try {
        return text(formatAlbum(await getAlbum(id)))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_artist",
    {
      title: "Get artist",
      description: "One Spotify artist: followers, genres, link.",
      inputSchema: z.object({
        id: z.string().describe("Spotify artist id (use search to find it)"),
      }),
      annotations: READ_ONLY,
    },
    async ({ id }) => {
      try {
        return text(formatArtist(await getArtist(id)))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof SpotifyError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
