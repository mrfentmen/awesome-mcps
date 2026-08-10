import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { convert } from "./api.js"
import { latest } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ecb-rates-mcp", version: "1.0.0" })
  server.tool("latest", "Latest ECB reference rates.", {  }, async (args) => {
    try { return text(await latest(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("convert", "Convert an amount between currencies.", { amount: z.number().describe("Amount to convert."), from: z.string().describe("Source currency.").optional(), to: z.string().describe("Target currency.") }, async (args) => {
    try { return text(await convert(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
