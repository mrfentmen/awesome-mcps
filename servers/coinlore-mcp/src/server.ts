import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { tickers, coin, globalStats, markets } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'coinlore-mcp', version: '1.0.0' })
  server.tool('tickers', 'Top coins by market cap.', { limit: z.number().describe('Max results.').optional() }, async (args) => {
    try { return text(await tickers(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('coin', 'One coin by id.', { id: z.number().describe('CoinLore id.').optional() }, async (args) => {
    try { return text(await coin(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('globalStats', 'Global crypto market stats.', {}, async (args) => {
    try { return text(await globalStats(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('markets', 'Markets for a coin id.', { id: z.number().describe('CoinLore id.').optional() }, async (args) => {
    try { return text(await markets(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
