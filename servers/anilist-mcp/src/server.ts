import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { searchAnime, searchManga } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'anilist-mcp', version: '1.0.0' })
  server.registerTool(
    'searchAnime',
    {
      title: "Search Anime",
      description: 'Search AniList anime.',
      inputSchema: z.object( { query: z.string().describe('Title search.').optional(), limit: z.number().describe('Max results.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchAnime(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'searchManga',
    {
      title: "Search Manga",
      description: 'Search AniList manga.',
      inputSchema: z.object( { query: z.string().describe('Title search.').optional(), limit: z.number().describe('Max results.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchManga(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
