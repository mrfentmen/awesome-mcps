import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { wantedList, search, topRewards } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'fbi-wanted-mcp', version: '1.0.0' })
  server.tool('wantedList', 'Paginated FBI Wanted list.', { page: z.number().describe('Page number.').optional(), pageSize: z.number().describe('Results per page.').optional() }, async (args) => {
    try { return text(await wantedList(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('search', 'Search FBI Wanted by title.', { title: z.string().describe('Search term.').optional(), pageSize: z.number().describe('Results per page.').optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('topRewards', 'Most wanted with reward amounts.', {}, async (args) => {
    try { return text(await topRewards(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
