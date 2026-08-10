import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { history } from "./api.js"
import { latest } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "currency-history-mcp", version: "1.0.0" })
  server.tool("latest", "Latest exchange rates.", { base: z.string().describe("Base currency like USD.").optional() }, async (args) => {
    try { return text(await latest(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("history", "Rates for a date range.", { base: z.string().describe("Base currency.").optional(), symbols: z.string().describe("Comma separated targets.").optional() }, async (args) => {
    try { return text(await history(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
