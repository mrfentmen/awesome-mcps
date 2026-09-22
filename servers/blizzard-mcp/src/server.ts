import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { BlizzardError, diabloSeasons, wowAchievements, wowTokenPrice } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const region = z.enum(["us", "eu", "kr", "tw"]).default("us")

export function createServer(): McpServer {
  const server = new McpServer({
    name: "blizzard-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "wow_token_price",
    {
      title: "WoW token price",
      description: "Current WoW Token gold price for a region.",
      inputSchema: z.object({ region }),
      annotations: READ_ONLY,
    },
    async ({ region: rg }) => {
      try {
        return text(await wowTokenPrice(rg))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "wow_achievements",
    {
      title: "WoW achievements",
      description: "Sample World of Warcraft achievements with ids.",
      inputSchema: z.object({
        region,
        limit: z.number().int().min(1).max(50).default(10),
      }),
      annotations: READ_ONLY,
    },
    async ({ region: rg, limit }) => {
      try {
        const rows = await wowAchievements(rg, limit)
        if (rows.length === 0) return text("No achievements.")
        return text(rows.map((a, i) => `${i + 1}. [${a.id}] ${a.name}`).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "diablo_seasons",
    {
      title: "Diablo seasons",
      description: "Recent Diablo 3 seasons (newest first).",
      inputSchema: z.object({ region }),
      annotations: READ_ONLY,
    },
    async ({ region: rg }) => {
      try {
        const rows = await diabloSeasons(rg)
        if (rows.length === 0) return text("No seasons.")
        return text(rows.map((s, i) => `${i + 1}. Season ${s.id}`).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof BlizzardError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
