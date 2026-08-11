import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_history, m0_latest, m1_convert, m1_latest } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'frankfurter-mcp', version: '1.0.0' })
server.tool("latest", "Latest conversion rates.", { from: z.string().describe("Base currency.").optional(), to: z.string().describe("Target currency.").optional() }, async (args) => {
    try { return text(await m0_latest(args)) } catch (e) { return text(error(e)) }
  })
server.tool("history", "Rate history for a period.", { from: z.string().describe("Base currency."), to: z.string().describe("Target currency."), start: z.string().describe("Start date YYYY-MM-DD."), end: z.string().describe("End date YYYY-MM-DD.") }, async (args) => {
    try { return text(await m0_history(args)) } catch (e) { return text(error(e)) }
  })
server.tool("convert", "Convert an amount between currencies.", { amount: z.number().describe("Amount to convert."), from: z.string().describe("Source currency.").optional(), to: z.string().describe("Target currency.") }, async (args) => {
    try { return text(await m1_convert(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
