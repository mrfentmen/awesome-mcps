import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { searchAnime, searchManga } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'anilist-mcp', version: '1.0.0' })
  server.tool('searchAnime', 'Search AniList anime.', { query: z.string().describe('Title search.').optional(), limit: z.number().describe('Max results.').optional() }, async (args) => {
    try { return text(await searchAnime(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('searchManga', 'Search AniList manga.', { query: z.string().describe('Title search.').optional(), limit: z.number().describe('Max results.').optional() }, async (args) => {
    try { return text(await searchManga(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
