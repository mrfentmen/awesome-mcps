import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { cardInfo } from "./api.js"
import { randomCards } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "tarot-mcp", version: "1.0.0" })
  server.tool("random_cards", "Draw random tarot cards.", { count: z.number().describe("How many cards.").optional() }, async (args) => {
    try { return text(await randomCards(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("card_info", "Get the meaning of a specific card.", { card: z.string().describe("Card short name like ar00.") }, async (args) => {
    try { return text(await cardInfo(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
