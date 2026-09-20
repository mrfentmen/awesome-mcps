import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { animeInfo } from "./api.js"
import { searchAnime } from "./api.js"
import { seasonAnime } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "jikan-mcp", version: "1.0.0" })
  server.registerTool(
    "search_anime",
    {
      title: "Search anime",
      description: "Search anime by title.",
      inputSchema: z.object( { query: z.string().describe("Anime title."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchAnime(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "anime_info",
    {
      title: "Anime info",
      description: "Get details for an anime by MyAnimeList ID.",
      inputSchema: z.object( { animeId: z.number().describe("MAL anime ID.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await animeInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "season_anime",
    {
      title: "Season anime",
      description: "List anime airing in the current season.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await seasonAnime(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
