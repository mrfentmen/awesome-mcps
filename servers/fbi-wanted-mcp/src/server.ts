import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { wantedList, search, topRewards } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'fbi-wanted-mcp', version: '1.0.0' })
  server.registerTool(
    'wantedList',
    {
      title: "Wanted List",
      description: 'Paginated FBI Wanted list.',
      inputSchema: z.object( { page: z.number().describe('Page number.').optional(), pageSize: z.number().describe('Results per page.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await wantedList(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'search',
    {
      title: "Search",
      description: 'Search FBI Wanted by title.',
      inputSchema: z.object( { title: z.string().describe('Search term.').optional(), pageSize: z.number().describe('Results per page.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await search(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'topRewards',
    {
      title: "Top Rewards",
      description: 'Most wanted with reward amounts.',
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await topRewards(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
