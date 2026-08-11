import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { search, byOwner } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'swaggerhub-mcp', version: '1.0.0' })
  server.tool('search', 'Search the SwaggerHub registry.', { query: z.string().describe('Search terms.').optional(), limit: z.number().describe('Max results.').optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('byOwner', 'List APIs by owner.', { owner: z.string().describe('Owner user or org.').optional(), limit: z.number().describe('Max results.').optional() }, async (args) => {
    try { return text(await byOwner(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
