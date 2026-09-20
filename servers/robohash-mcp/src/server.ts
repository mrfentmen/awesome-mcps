import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { avatar } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'robohash-mcp', version: '1.0.0' })
  server.registerTool(
    'avatar',
    {
      title: "Avatar",
      description: 'RoboHash robot avatar URL.',
      inputSchema: z.object( { text: z.string().describe('Seed text.').optional(), size: z.number().describe('Pixels, default 300.').optional(), set: z.number().describe('Robot set 1-5.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await avatar(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
