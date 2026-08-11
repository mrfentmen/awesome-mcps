import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { ticker, latestBlock, address } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: 'blockchain-info-mcp', version: '1.0.0' })
  server.tool('ticker', 'Bitcoin price across currencies.', {}, async (args) => {
    try { return text(await ticker(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('latestBlock', 'Latest Bitcoin block.', {}, async (args) => {
    try { return text(await latestBlock(args)) } catch (e) { return text(error(e)) }
  })
  server.tool('address', 'Bitcoin address balance and recent txs.', { address: z.string().describe('Bitcoin address.').optional() }, async (args) => {
    try { return text(await address(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
