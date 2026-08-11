import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { random, today, quotes } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'zenquotes-mcp', version: '1.0.0' })
  server.tool('random', 'Random inspirational quote.', {}, async (args) => {
    try { return text(await random(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('today', 'Quote of the day.', {}, async (args) => {
    try { return text(await today(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('quotes', 'List of quotes.', { limit: z.number().describe('Max results.').optional() }, async (args) => {
    try { return text(await quotes(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
