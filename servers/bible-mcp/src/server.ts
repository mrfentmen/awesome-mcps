import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { verse, search, kjvChapter } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'bible-mcp', version: '1.0.0' })
  server.registerTool(
    'verse',
    {
      title: "Verse",
      description: 'Read Bible verses by reference from bible-api.com.',
      inputSchema: z.object( { reference: z.string().describe('Reference like John 3:16.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await verse(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'search',
    {
      title: "Search",
      description: 'Search Bible text for a phrase.',
      inputSchema: z.object( { query: z.string().describe('Search phrase.').optional(), limit: z.number().describe('Max results.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await search(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'kjvChapter',
    {
      title: "Kjv Chapter",
      description: 'Read a full KJV chapter from GetBible.',
      inputSchema: z.object( { book: z.string().describe('Book name like john.').optional(), chapter: z.number().describe('Chapter number.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await kjvChapter(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
