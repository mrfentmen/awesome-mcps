import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { avatar } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'robohash-mcp', version: '1.0.0' })
  server.tool('avatar', 'RoboHash robot avatar URL.', { text: z.string().describe('Seed text.').optional(), size: z.number().describe('Pixels, default 300.').optional(), set: z.number().describe('Robot set 1-5.').optional() }, async (args) => {
    try { return text(await avatar(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
