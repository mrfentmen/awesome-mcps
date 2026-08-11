import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { lookup, current } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'freeipapi-mcp', version: '1.0.0' })
  server.tool('lookup', 'Geolocate an IP address.', { ip: z.string().describe('IPv4 address.').optional() }, async (args) => {
    try { return text(await lookup(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('current', 'Geolocate the current caller IP.', {}, async (args) => {
    try { return text(await current(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
