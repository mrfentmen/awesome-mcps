import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { price } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "gold-prices-mcp", version: "1.0.0" })
  server.tool("price", "Current price for a metal.", { metal: z.string().describe("XAU gold, XAG silver, XPT platinum, or XPD palladium.").optional() }, async (args) => {
    try { return text(await price(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
