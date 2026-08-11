import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { readFeed, feedJson } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'rss-mcp', version: '1.0.0' })
  server.tool('readFeed', 'Fetch and parse any RSS or Atom feed directly.', { url: z.string().describe('Feed URL.').optional(), limit: z.number().describe('Max entries.').optional() }, async (args) => {
    try { return text(await readFeed(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('feedJson', 'Convert any RSS feed to JSON via rss2json.', { url: z.string().describe('Feed URL.').optional(), limit: z.number().describe('Max entries.').optional() }, async (args) => {
    try { return text(await feedJson(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
