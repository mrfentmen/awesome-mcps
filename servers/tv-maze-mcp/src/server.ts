import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { searchShows } from "./api.js"
import { showEpisodes } from "./api.js"
import { todaySchedule } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "tv-maze-mcp", version: "1.0.0" })
  server.tool("search_shows", "Search for TV shows by name.", { query: z.string().describe("Show name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchShows(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("show_episodes", "List episodes for a show by TVMaze ID.", { showId: z.number().describe("TVMaze show ID.") }, async (args) => {
    try { return text(await showEpisodes(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("today_schedule", "List shows airing today.", { country: z.string().describe("Two letter country code.").optional() }, async (args) => {
    try { return text(await todaySchedule(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
