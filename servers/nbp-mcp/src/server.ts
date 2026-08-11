import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { table, rates, gold } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'nbp-mcp', version: '1.0.0' })
  server.tool('table', 'Full NBP FX table A, B, or C.', { table: z.string().describe('A, B, or C.').optional() }, async (args) => {
    try { return text(await table(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('rates', 'One currency rate from NBP.', { currency: z.string().describe('Currency code like USD.').optional(), table: z.string().describe('A, B, or C.').optional() }, async (args) => {
    try { return text(await rates(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('gold', 'NBP gold price per gram.', { from: z.string().describe('Start date YYYY-MM-DD.').optional(), to: z.string().describe('End date YYYY-MM-DD.').optional() }, async (args) => {
    try { return text(await gold(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
