import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { searchMovie } from "./api.js"
import { searchTv } from "./api.js"
import { trending } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "tmdb-mcp", version: "1.0.0" })
  server.registerTool(
    "search_movie",
    {
      title: "Search movie",
      description: "Search for movies by title.",
      inputSchema: z.object( { query: z.string().describe("Movie title to search for."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchMovie(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "search_tv",
    {
      title: "Search tv",
      description: "Search for TV shows by title.",
      inputSchema: z.object( { query: z.string().describe("TV show title to search for."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchTv(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "trending",
    {
      title: "Trending",
      description: "Get trending movies and TV shows for the week.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await trending(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
