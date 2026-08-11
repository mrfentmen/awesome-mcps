import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { verse, search, kjvChapter } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'bible-mcp', version: '1.0.0' })
  server.tool('verse', 'Read Bible verses by reference from bible-api.com.', { reference: z.string().describe('Reference like John 3:16.').optional() }, async (args) => {
    try { return text(await verse(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('search', 'Search Bible text for a phrase.', { query: z.string().describe('Search phrase.').optional(), limit: z.number().describe('Max results.').optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('kjvChapter', 'Read a full KJV chapter from GetBible.', { book: z.string().describe('Book name like john.').optional(), chapter: z.number().describe('Chapter number.').optional() }, async (args) => {
    try { return text(await kjvChapter(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
