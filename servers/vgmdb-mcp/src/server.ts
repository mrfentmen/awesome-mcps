import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  VgmdbError,
  formatAlbumDetail,
  formatAlbumSearch,
  formatArtistDetail,
  formatArtistSearch,
  getAlbum,
  getArtist,
  searchAlbums,
  searchArtists,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "vgmdb-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_albums",
    {
      title: "Search albums",
      description: "Search for video game soundtrack albums by game or composer name. " +
      "Returns album ids for get_album.",
      inputSchema: z.object(
    { query: z.string().describe("e.g. 'Chrono Trigger OST' or 'NieR soundtrack'") }),
      annotations: READ_ONLY,
    },
    async ({ query }) => {
      try {
        const albums = await searchAlbums(query)
        if (albums.length === 0) return text(`No albums found for "${query}".`)
        return text(
          `Albums matching "${query}":\n` +
            albums.map((a, i) => `${i + 1}. ${formatAlbumSearch(a)}`).join("\n\n")
        )
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_album",
    {
      title: "Get album",
      description: "Get full album details: full tracklist with timings, release date, genre.",
      inputSchema: z.object(
    { id: z.string().describe("Album numeric id from search_albums") }),
      annotations: READ_ONLY,
    },
    async ({ id }) => {
      try {
        const album = await getAlbum(id)
        if (!album) return text(`No album with id "${id}".`)
        return text(formatAlbumDetail(album))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "search_artists",
    {
      title: "Search artists",
      description: "Search for video game composers / performers by name.",
      inputSchema: z.object(
    { query: z.string().describe("e.g. 'Yasunori Mitsuda' or 'Nobuo Uematsu'") }),
      annotations: READ_ONLY,
    },
    async ({ query }) => {
      try {
        const artists = await searchArtists(query)
        if (artists.length === 0) return text(`No artists found for "${query}".`)
        return text(
          `Artists matching "${query}":\n` +
            artists.map((a, i) => `${i + 1}. ${formatArtistSearch(a)}`).join("\n")
        )
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_artist",
    {
      title: "Get artist",
      description: "Get a composer's/artist's discography (albums).",
      inputSchema: z.object(
    { id: z.string().describe("Artist numeric id from search_artists") }),
      annotations: READ_ONLY,
    },
    async ({ id }) => {
      try {
        const artist = await getArtist(id)
        if (!artist) return text(`No artist with id "${id}".`)
        return text(formatArtistDetail(artist))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof VgmdbError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
