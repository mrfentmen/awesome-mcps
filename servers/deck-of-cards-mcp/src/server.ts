import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { draw } from "./api.js"
import { newDeck } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "deck-of-cards-mcp", version: "1.0.0" })
  server.tool("new_deck", "Create and shuffle a deck.", { decks: z.number().describe("Number of decks, 1 to 8.").optional() }, async (args) => {
    try { return text(await newDeck(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("draw", "Draw cards from a deck.", { deckId: z.string().describe("Deck ID."), count: z.number().describe("Cards to draw.").optional() }, async (args) => {
    try { return text(await draw(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
