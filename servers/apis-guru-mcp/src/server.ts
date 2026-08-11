import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { search, byName } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'apis-guru-mcp', version: '1.0.0' })
  server.tool('search', 'Search the APIs.guru directory.', { query: z.string().describe('Search terms.').optional(), limit: z.number().describe('Max results.').optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('byName', 'Get one API by directory name.', { name: z.string().describe('Name like openai.com.').optional() }, async (args) => {
    try { return text(await byName(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
