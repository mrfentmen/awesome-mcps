import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { coin } from "./api.js"
import { coins } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "cryptorank-mcp", version: "1.0.0" })
  server.tool("coins", "List ranked coins.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await coins(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("coin", "Get a coin by key.", { key: z.string().describe("Coin key like bitcoin.") }, async (args) => {
    try { return text(await coin(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
