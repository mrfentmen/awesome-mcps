import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { ticker, board, markets } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'bitflyer-mcp', version: '1.0.0' })
  server.tool('ticker', 'BitFlyer ticker for a product.', { product: z.string().describe('Product code, default BTC_JPY.').optional() }, async (args) => {
    try { return text(await ticker(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('board', 'BitFlyer order book depth.', { product: z.string().describe('Product code, default BTC_JPY.').optional(), depth: z.number().describe('Levels per side.').optional() }, async (args) => {
    try { return text(await board(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('markets', 'List BitFlyer spot markets.', {}, async (args) => {
    try { return text(await markets(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
