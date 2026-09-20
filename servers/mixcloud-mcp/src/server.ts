import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { search, user } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'mixcloud-mcp', version: '1.0.0' })
  server.registerTool(
    'search',
    {
      title: "Search",
      description: 'Search Mixcloud cloudcasts.',
      inputSchema: z.object( { query: z.string().describe('Search terms.').optional(), limit: z.number().describe('Max results.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await search(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'user',
    {
      title: "User",
      description: 'Mixcloud user profile.',
      inputSchema: z.object( { user: z.string().describe('User name.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await user(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
