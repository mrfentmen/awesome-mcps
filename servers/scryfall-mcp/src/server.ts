import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  ScryfallError,
  formatCard,
  formatRuling,
  getCardByFuzzyName,
  getCardRulings,
  getSets,
  searchCards,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })

export function createServer(): McpServer {
  const server = new McpServer({
    name: "scryfall-mcp",
    version: "1.0.0",
  })

  server.tool(
    "search_cards",
    "Search Magic: The Gathering cards by Scryfall syntax — card name, " +
      "oracle text, color, type, e.g. 'c:red type:dragon', " +
      "'o:\"when ~ enters\" legendary creature'.",
    { query: z.string().describe("Scryfall search query") },
    async ({ query }) => {
      try {
        const cards = await searchCards(query)
        if (cards.length === 0) return text(`No cards match "${query}".`)
        return text(`Cards matching "${query}":\n\n${cards.map((c, i) => formatCard(c, i)).join("\n\n")}`)
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )

  server.tool(
    "get_card",
    "Get a single card by fuzzy name (e.g. 'bolas citadel' → Bolas's Citadel).",
    { name: z.string().describe("Card name (fuzzy match ok)") },
    async ({ name }) => {
      try {
        const card = await getCardByFuzzyName(name)
        if (!card) return text(`No card named "${name}".`)
        return text(formatCard(card))
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )

  server.tool(
    "get_rulings",
    "Get official Gatherer rulings for a card by fuzzy name.",
    { name: z.string().describe("Card name") },
    async ({ name }) => {
      try {
        const card = await getCardByFuzzyName(name)
        if (!card) return text(`No card named "${name}".`)
        const rulings = await getCardRulings(card.id)
        if (rulings.length === 0) return text(`${card.name} has no rulings on file.`)
        return text(`Rulings for ${card.name}:\n${rulings.map(formatRuling).join("\n")}`)
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )

  server.tool(
    "list_sets",
    "List recent Magic sets with release dates and card counts.",
    {},
    async () => {
      try {
        const sets = await getSets()
        return text(
          `Recent Magic sets:\n` +
            sets
              .map(
                (s, i) =>
                  `${i + 1}. ${s.name} [${s.code}] (${s.set_type ?? "?"})${
                    s.released_at ? `, ${s.released_at}` : ""
                  }${s.card_count ? `, ${s.card_count} cards` : ""}`
              )
              .join("\n")
        )
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof ScryfallError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
