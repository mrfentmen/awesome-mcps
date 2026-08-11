import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_schedule, m0_search, m1_searchShows, m1_showEpisodes, m1_todaySchedule } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'tvmaze-mcp', version: '1.0.0' })
server.tool("search", "Search shows.", { query: z.string().describe("Show name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_search(args)) } catch (e) { return text(error(e)) }
  })
server.tool("schedule", "Schedule for a date and country.", { country: z.string().describe("ISO country like US.").optional(), date: z.string().describe("YYYY-MM-DD.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m0_schedule(args)) } catch (e) { return text(error(e)) }
  })
server.tool("search_shows", "Search for TV shows by name.", { query: z.string().describe("Show name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await m1_searchShows(args)) } catch (e) { return text(error(e)) }
  })
server.tool("show_episodes", "List episodes for a show by TVMaze ID.", { showId: z.number().describe("TVMaze show ID.") }, async (args) => {
    try { return text(await m1_showEpisodes(args)) } catch (e) { return text(error(e)) }
  })
server.tool("today_schedule", "List shows airing today.", { country: z.string().describe("Two letter country code.").optional() }, async (args) => {
    try { return text(await m1_todaySchedule(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
