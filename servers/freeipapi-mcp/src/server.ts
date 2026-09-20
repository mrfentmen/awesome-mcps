import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { lookup, current } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'freeipapi-mcp', version: '1.0.0' })
  server.registerTool(
    'lookup',
    {
      title: "Lookup",
      description: 'Geolocate an IP address.',
      inputSchema: z.object( { ip: z.string().describe('IPv4 address.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await lookup(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'current',
    {
      title: "Current",
      description: 'Geolocate the current caller IP.',
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await current(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
