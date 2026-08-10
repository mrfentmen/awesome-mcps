import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { history } from "./api.js"
import { latest } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "frankfurter-mcp", version: "1.0.0" })
  server.tool("latest", "Latest conversion rates.", { from: z.string().describe("Base currency.").optional(), to: z.string().describe("Target currency.").optional() }, async (args) => {
    try { return text(await latest(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("history", "Rate history for a period.", { from: z.string().describe("Base currency."), to: z.string().describe("Target currency."), start: z.string().describe("Start date YYYY-MM-DD."), end: z.string().describe("End date YYYY-MM-DD.") }, async (args) => {
    try { return text(await history(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
