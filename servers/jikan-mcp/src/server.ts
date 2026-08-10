import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { animeInfo } from "./api.js"
import { searchAnime } from "./api.js"
import { seasonAnime } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "jikan-mcp", version: "1.0.0" })
  server.tool("search_anime", "Search anime by title.", { query: z.string().describe("Anime title."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchAnime(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("anime_info", "Get details for an anime by MyAnimeList ID.", { animeId: z.number().describe("MAL anime ID.") }, async (args) => {
    try { return text(await animeInfo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("season_anime", "List anime airing in the current season.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await seasonAnime(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
