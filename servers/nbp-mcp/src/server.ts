import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { table, rates, gold } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'nbp-mcp', version: '1.0.0' })
  server.registerTool(
    'table',
    {
      title: "Table",
      description: 'Full NBP FX table A, B, or C.',
      inputSchema: z.object( { table: z.string().describe('A, B, or C.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await table(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'rates',
    {
      title: "Rates",
      description: 'One currency rate from NBP.',
      inputSchema: z.object( { currency: z.string().describe('Currency code like USD.').optional(), table: z.string().describe('A, B, or C.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await rates(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'gold',
    {
      title: "Gold",
      description: 'NBP gold price per gram.',
      inputSchema: z.object( { from: z.string().describe('Start date YYYY-MM-DD.').optional(), to: z.string().describe('End date YYYY-MM-DD.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await gold(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
