import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { search, user } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'mixcloud-mcp', version: '1.0.0' })
  server.tool('search', 'Search Mixcloud cloudcasts.', { query: z.string().describe('Search terms.').optional(), limit: z.number().describe('Max results.').optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('user', 'Mixcloud user profile.', { user: z.string().describe('User name.').optional() }, async (args) => {
    try { return text(await user(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
