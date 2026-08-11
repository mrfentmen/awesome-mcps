import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_price, m1_all, m1_price } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'gold-prices-mcp', version: '1.0.0' })
server.tool("price", "Current price for a metal.", { metal: z.string().describe("XAU gold, XAG silver, XPT platinum, or XPD palladium.").optional() }, async (args) => {
    try { return text(await m0_price(args)) } catch (e) { return text(error(e)) }
  })
server.tool("all", "Prices for all tracked metals.", {  }, async (args) => {
    try { return text(await m1_all(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
