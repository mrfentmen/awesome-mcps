import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { convert } from "./api.js"
import { latest } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "er-api-mcp", version: "1.0.0" })
  server.tool("latest", "Get latest exchange rates.", { base: z.string().describe("Base currency code (USD or EUR).").optional() }, async (args) => {
    try { return text(await latest(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("convert", "Convert an amount between currencies.", { from: z.string().describe("Source currency."), to: z.string().describe("Target currency."), amount: z.number().describe("Amount.") }, async (args) => {
    try { return text(await convert(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
