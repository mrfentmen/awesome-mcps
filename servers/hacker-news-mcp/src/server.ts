import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { top, jobs, ask, item, search, frontPage } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'hacker-news-mcp', version: '1.0.0' })
  server.tool('top', 'Top stories from the Hacker News Firebase API.', { limit: z.number().describe('Max stories.').optional() }, async (args) => {
    try { return text(await top(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('jobs', 'Latest job postings.', { limit: z.number().describe('Max jobs.').optional() }, async (args) => {
    try { return text(await jobs(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('ask', 'Latest Ask HN threads.', { limit: z.number().describe('Max threads.').optional() }, async (args) => {
    try { return text(await ask(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('item', 'Look up one Hacker News item by id.', { id: z.number().describe('Item id.').optional() }, async (args) => {
    try { return text(await item(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('search', 'Search stories on Algolia.', { query: z.string().describe('Search query.').optional(), limit: z.number().describe('Max results.').optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('frontPage', 'Current front page from Algolia.', { limit: z.number().describe('Max stories.').optional() }, async (args) => {
    try { return text(await frontPage(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
