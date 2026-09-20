import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { draw } from "./api.js"
import { newDeck } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "deck-of-cards-mcp", version: "1.0.0" })
  server.registerTool(
    "new_deck",
    {
      title: "New deck",
      description: "Create and shuffle a deck.",
      inputSchema: z.object( { decks: z.number().describe("Number of decks, 1 to 8.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await newDeck(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "draw",
    {
      title: "Draw",
      description: "Draw cards from a deck.",
      inputSchema: z.object( { deckId: z.string().describe("Deck ID."), count: z.number().describe("Cards to draw.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await draw(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
