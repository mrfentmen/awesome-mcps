import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_hiscore, m1_OsrsError, m1_formatStats, m1_getHotItems, m1_getItemPrice, m1_getPlayerStats } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

const m1_MODES = ["normal", "ironman", "ultimate", "hardcore", "deadman"] as const

export function createServer(): McpServer {
  const server = new McpServer({ name: 'runescape-mcp', version: '1.0.0' })
server.tool("hiscore", "Hiscore for a player.", { player: z.string().describe("Player name.") }, async (args) => {
    try { return text(await m0_hiscore(args)) } catch (e) { return text(error(e)) }
  })
server.tool(
    "get_player_stats",
    "Get an OSRS player's hiscores: levels, XP, clue scrolls, and boss " +
      "kill counts. Modes: normal / ironman / ultimate / hardcore / deadman.",
    {
      username: z.string().describe("RuneScape username, e.g. 'Zezima'"),
      mode: z.enum(m1_MODES).default("normal").describe("Account type"),
    },
    async ({ username, mode }) => {
      try {
        const stats = await m1_getPlayerStats(username, mode)
        return text(m1_formatStats(stats))
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )
server.tool(
    "get_item_price",
    "Get the current Grand Exchange price of an item (buy/sell spread).",
    { name: z.string().describe("Item name, e.g. 'Bandos chestplate' or 'Rune scimitar'") },
    async ({ name }) => {
      try {
        const p = await m1_getItemPrice(name)
        if (!p) return text(`No GE item matches "${name}". Try 'osrs get_item_price' with a different name.`)
        const lines = [
          `${p.name} [id ${p.id}]${p.members ? " (members)" : " (free)"}`,
          `Buy: ${p.high > 0 ? p.high.toLocaleString() + " gp" : "no trade today"}`,
          `Sell: ${p.low > 0 ? p.low.toLocaleString() + " gp" : "no trade today"}`,
          `Spread: ${p.high > 0 && p.low > 0 ? (p.high - p.low).toLocaleString() + " gp" : "—"}`,
        ]
        return text(lines.join("\n"))
      } catch (e) {
        return text(errorMessage(e))
      }
    }
  )
server.tool(
    "get_hot_items",
    "What's trading the most on the Grand Exchange right now — ranked by " +
      "trade volume in the last hour, with current buy/sell averages.",
    { limit: z.number().int().min(3).max(15).default(10).describe("How many items to show") },
    async ({ limit }) => {
      try {
        const items = await m1_getHotItems(limit)
        if (items.length === 0) return text("No trade volume data right now.")
        return text(
          `🔥 Hottest GE items (last hour):\n` +
            items
              .map(
                (m, i) =>
                  `${i + 1}. ${m.name} — vol ${m.volume.toLocaleString()} | buy ${m.avgHigh > 0 ? m.avgHigh.toLocaleString() + " gp" : "—"} / sell ${m.avgLow > 0 ? m.avgLow.toLocaleString() + " gp" : "—"}`
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
