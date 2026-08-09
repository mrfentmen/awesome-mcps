import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  SteamError,
  formatAppDetail,
  formatStoreItem,
  getAppDetail,
  getNews,
  searchStore,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })

export function createServer(): McpServer {
  const server = new McpServer({
    name: "steam-mcp",
    version: "1.0.0",
  })

  server.tool(
    "search_games",
    "Search the Steam store by title. Returns appids with current prices " +
      "and discounts.",
    { query: z.string().describe("Game title, e.g. 'Helldivers' or 'Baldur'") },
    async ({ query }) => {
      try {
        const items = await searchStore(query)
        if (items.length === 0) return text(`Nothing on Steam matches "${query}".`)
        return text(
          `Steam results for "${query}":\n` +
            items.map((i, n) => `${n + 1}. ${formatStoreItem(i)}`).join("\n")
        )
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )

  server.tool(
    "get_game_details",
    "Get details for a Steam app: price/discount, release date, " +
      "developers, genres, Metacritic, description.",
    { appid: z.number().int().describe("Steam app id from search_games") },
    async ({ appid }) => {
      try {
        const detail = await getAppDetail(appid)
        if (!detail) return text(`No Steam app with id ${appid}.`)
        return text(formatAppDetail(detail))
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )

  server.tool(
    "get_game_news",
    "Fetch recent Steam news posts for a game.",
    {
      appid: z.number().int().describe("Steam app id"),
      count: z.number().int().min(1).max(20).default(5).describe("Number of posts"),
    },
    async ({ appid, count }) => {
      try {
        const news = await getNews(appid, count)
        if (news.length === 0) return text(`No news for app ${appid}.`)
        return text(
          `Latest news for app ${appid}:\n` +
            news
              .map(
                (n, i) =>
                  `${i + 1}. ${n.title}${n.date ? ` (${n.date})` : ""}` +
                  (n.author ? ` by ${n.author}` : "") +
                  `\n   ${n.url}` +
                  (n.contents ? `\n   ${n.contents}` : "")
              )
              .join("\n\n")
        )
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof SteamError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
