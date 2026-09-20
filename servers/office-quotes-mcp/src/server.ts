import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { randomQuote, quoteById } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'office-quotes-mcp', version: '1.0.0' })
  server.registerTool(
    'randomQuote',
    {
      title: "Random Quote",
      description: 'Random The Office quote.',
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await randomQuote(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'quoteById',
    {
      title: "Quote By Id",
      description: 'Quote by id.',
      inputSchema: z.object( { id: z.number().describe('Quote id.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await quoteById(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
