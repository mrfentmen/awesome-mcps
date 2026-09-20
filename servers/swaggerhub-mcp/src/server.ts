import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { search, byOwner } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'swaggerhub-mcp', version: '1.0.0' })
  server.registerTool(
    'search',
    {
      title: "Search",
      description: 'Search the SwaggerHub registry.',
      inputSchema: z.object( { query: z.string().describe('Search terms.').optional(), limit: z.number().describe('Max results.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await search(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'byOwner',
    {
      title: "By Owner",
      description: 'List APIs by owner.',
      inputSchema: z.object( { owner: z.string().describe('Owner user or org.').optional(), limit: z.number().describe('Max results.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await byOwner(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
