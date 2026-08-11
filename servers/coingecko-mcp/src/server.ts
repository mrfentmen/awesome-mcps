import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_price, m0_trending } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'coingecko-mcp', version: '1.0.0' })
server.tool("price", "Price for one coin.", { coin: z.string().describe("Coin id like bitcoin."), currency: z.string().describe("Currency like usd.").optional() }, async (args) => {
    try { return text(await m0_price(args)) } catch (e) { return text(error(e)) }
  })
server.tool("trending", "Trending coins.", {  }, async (args) => {
    try { return text(await m0_trending(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
