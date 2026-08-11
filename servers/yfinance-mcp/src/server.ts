import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_quote, m0_search, m1_quote, m1_searchSymbol } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'yfinance-mcp', version: '1.0.0' })
server.tool("quote", "Get a stock quote and recent price data.", { symbol: z.string().describe("Stock symbol like AAPL."), range: z.string().describe("Range like 5d, 1mo, 1y.").optional() }, async (args) => {
    try { return text(await m0_quote(args)) } catch (e) { return text(error(e)) }
  })
server.tool("search", "Search stock symbols.", { query: z.string().describe("Company name or symbol.") }, async (args) => {
    try { return text(await m0_search(args)) } catch (e) { return text(error(e)) }
  })
server.tool("search_symbol", "Search for a symbol by company name.", { query: z.string().describe("Company name.") }, async (args) => {
    try { return text(await m1_searchSymbol(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
