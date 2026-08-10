import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { klines } from "./api.js"
import { price } from "./api.js"
import { ticker } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "binance-market-mcp", version: "1.0.0" })
  server.tool("ticker", "Get the 24 hour ticker for a symbol.", { symbol: z.string().describe("Symbol like BTCUSDT.") }, async (args) => {
    try { return text(await ticker(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("klines", "Get candlestick data for a symbol.", { symbol: z.string().describe("Symbol like BTCUSDT."), interval: z.string().describe("1m, 1h, 1d, or 1w.").optional(), limit: z.number().describe("Max candles.").optional() }, async (args) => {
    try { return text(await klines(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("price", "Get the current price for a symbol.", { symbol: z.string().describe("Symbol like BTCUSDT.") }, async (args) => {
    try { return text(await price(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
