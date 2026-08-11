import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { indexPrice, ticker, supported } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'deribit-mcp', version: '1.0.0' })
  server.tool('indexPrice', 'Deribit index price.', { index: z.string().describe('Index name, default btc_usd.').optional() }, async (args) => {
    try { return text(await indexPrice(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('ticker', 'Deribit instrument ticker.', { instrument: z.string().describe('Instrument, default BTC-PERPETUAL.').optional() }, async (args) => {
    try { return text(await ticker(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('supported', 'List supported index names.', {}, async (args) => {
    try { return text(await supported(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
