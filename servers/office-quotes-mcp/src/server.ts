import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { randomQuote, quoteById } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'office-quotes-mcp', version: '1.0.0' })
  server.tool('randomQuote', 'Random The Office quote.', {}, async (args) => {
    try { return text(await randomQuote(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('quoteById', 'Quote by id.', { id: z.number().describe('Quote id.').optional() }, async (args) => {
    try { return text(await quoteById(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
