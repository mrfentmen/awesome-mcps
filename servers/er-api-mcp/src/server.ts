import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_convert, m0_latest, m1_history, m1_latest } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'er-api-mcp', version: '1.0.0' })
server.registerTool(
    "latest",
    {
      title: "Latest",
      description: "Get latest exchange rates.",
      inputSchema: z.object( { base: z.string().describe("Base currency code (USD or EUR).").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_latest(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "convert",
    {
      title: "Convert",
      description: "Convert an amount between currencies.",
      inputSchema: z.object( { from: z.string().describe("Source currency."), to: z.string().describe("Target currency."), amount: z.number().describe("Amount.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_convert(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "history",
    {
      title: "History",
      description: "Rates for a date range.",
      inputSchema: z.object( { base: z.string().describe("Base currency.").optional(), symbols: z.string().describe("Comma separated targets.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_history(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
