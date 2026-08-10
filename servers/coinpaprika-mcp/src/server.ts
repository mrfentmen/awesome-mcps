import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { coin } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "coinpaprika-mcp", version: "1.0.0" })
  server.tool("coin", "Details for one coin.", { id: z.string().describe("Coin id like btc-bitcoin.") }, async (args) => {
    try { return text(await coin(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search", "Search coins.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
