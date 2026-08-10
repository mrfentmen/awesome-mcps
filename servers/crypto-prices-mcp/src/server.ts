import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { price } from "./api.js"
import { trending } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "crypto-prices-mcp", version: "1.0.0" })
  server.tool("price", "Get the price of coins in a currency.", { coins: z.string().describe("Comma separated coin ids like bitcoin,ethereum."), currency: z.string().describe("Currency code like usd.").optional() }, async (args) => {
    try { return text(await price(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("trending", "Get trending coins on CoinGecko.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await trending(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
