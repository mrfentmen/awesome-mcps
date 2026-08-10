import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { convert } from "./api.js"
import { latestRates } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "fx-rates-mcp", version: "1.0.0" })
  server.tool("latest_rates", "Get the latest exchange rates for a base currency.", { base: z.string().describe("Base currency code."), to: z.string().describe("Comma separated target codes.").optional() }, async (args) => {
    try { return text(await latestRates(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("convert", "Convert an amount between two currencies.", { amount: z.number().describe("Amount to convert."), from: z.string().describe("Source currency code."), to: z.string().describe("Target currency code.") }, async (args) => {
    try { return text(await convert(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
