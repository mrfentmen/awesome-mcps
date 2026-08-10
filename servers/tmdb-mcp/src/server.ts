import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { searchMovie } from "./api.js"
import { searchTv } from "./api.js"
import { trending } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "tmdb-mcp", version: "1.0.0" })
  server.tool("search_movie", "Search for movies by title.", { query: z.string().describe("Movie title to search for."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchMovie(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search_tv", "Search for TV shows by title.", { query: z.string().describe("TV show title to search for."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchTv(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("trending", "Get trending movies and TV shows for the week.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await trending(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
