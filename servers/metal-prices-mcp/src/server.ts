import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { all } from "./api.js"
import { price } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "metal-prices-mcp", version: "1.0.0" })
  server.tool("price", "Spot price for one metal.", { metal: z.string().describe("Metal like XAU or gold.") }, async (args) => {
    try { return text(await price(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("all", "Prices for all tracked metals.", {  }, async (args) => {
    try { return text(await all(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
