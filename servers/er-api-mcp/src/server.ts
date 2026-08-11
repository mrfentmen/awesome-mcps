import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_convert, m0_latest, m1_history, m1_latest } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'er-api-mcp', version: '1.0.0' })
server.tool("latest", "Get latest exchange rates.", { base: z.string().describe("Base currency code (USD or EUR).").optional() }, async (args) => {
    try { return text(await m0_latest(args)) } catch (e) { return text(error(e)) }
  })
server.tool("convert", "Convert an amount between currencies.", { from: z.string().describe("Source currency."), to: z.string().describe("Target currency."), amount: z.number().describe("Amount.") }, async (args) => {
    try { return text(await m0_convert(args)) } catch (e) { return text(error(e)) }
  })
server.tool("history", "Rates for a date range.", { base: z.string().describe("Base currency.").optional(), symbols: z.string().describe("Comma separated targets.").optional() }, async (args) => {
    try { return text(await m1_history(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
