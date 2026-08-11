import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { cards } from "./api.js"
import { sets } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "mtg-mcp", version: "1.0.0" })
  server.tool("cards", "Search cards.", { name: z.string().describe("Card name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await cards(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("sets", "List card sets.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await sets(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
