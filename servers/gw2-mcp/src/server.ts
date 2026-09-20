import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import {
  Gw2Error,
  formatAchievement,
  formatItem,
  formatPrice,
  getAchievement,
  getDailyAchievements,
  getItem,
  getItemPrice,
  searchItems,
} from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "gw2-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_items",
    {
      title: "Search items",
      description: "Search Guild Wars 2 items by name.",
      inputSchema: z.object(
    { name: z.string().describe("Item name, e.g. 'Zojja' or 'Eternal Forge'"), limit: z.number().int().min(1).max(20).default(10) }),
      annotations: READ_ONLY,
    },
    async ({ name, limit }) => {
      try {
        const items = await searchItems(name, limit)
        if (items.length === 0) return text(`No GW2 items match "${name}".`)
        return text(`Items matching "${name}":\n\n${items.map((i) => formatItem(i)).join("\n\n")}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_item",
    {
      title: "Get item",
      description: "Get a GW2 item by id.",
      inputSchema: z.object(
    { id: z.number().int().describe("Item id from search_items") }),
      annotations: READ_ONLY,
    },
    async ({ id }) => {
      try {
        const item = await getItem(id)
        if (!item) return text(`No item ${id}.`)
        return text(formatItem(item))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_item_price",
    {
      title: "Get item price",
      description: "Trading Post buy and sell prices for an item.",
      inputSchema: z.object(
    { id: z.number().int().describe("Item id") }),
      annotations: READ_ONLY,
    },
    async ({ id }) => {
      try {
        const price = await getItemPrice(id)
        if (!price) return text(`No trading data for item ${id}.`)
        return text(`Trading Post for ${id}:\n${formatPrice(price)}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_achievement",
    {
      title: "Get achievement",
      description: "Get a GW2 achievement by id.",
      inputSchema: z.object(
    { id: z.number().int().describe("Achievement id") }),
      annotations: READ_ONLY,
    },
    async ({ id }) => {
      try {
        const a = await getAchievement(id)
        if (!a) return text(`No achievement ${id}.`)
        return text(formatAchievement(a))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_daily_achievements",
    {
      title: "Get daily achievements",
      description: "Today's PvE daily achievements.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
      try {
        const daily = await getDailyAchievements()
        if (daily.length === 0) return text("No dailies available.")
        const out: string[] = []
        for (const d of daily) {
          const a = await getAchievement(d.id)
          if (a) out.push(`- ${a.name}${d.level_min ? ` (lvl ${d.level_min}+)` : ""}`)
        }
        return text(`Today's GW2 dailies:\n${out.join("\n")}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof Gw2Error) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
