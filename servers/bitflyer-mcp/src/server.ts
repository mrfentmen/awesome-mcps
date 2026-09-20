import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { ticker, board, markets } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'bitflyer-mcp', version: '1.0.0' })
  server.registerTool(
    'ticker',
    {
      title: "Ticker",
      description: 'BitFlyer ticker for a product.',
      inputSchema: z.object( { product: z.string().describe('Product code, default BTC_JPY.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await ticker(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'board',
    {
      title: "Board",
      description: 'BitFlyer order book depth.',
      inputSchema: z.object( { product: z.string().describe('Product code, default BTC_JPY.').optional(), depth: z.number().describe('Levels per side.').optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await board(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    'markets',
    {
      title: "Markets",
      description: 'List BitFlyer spot markets.',
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await markets(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
