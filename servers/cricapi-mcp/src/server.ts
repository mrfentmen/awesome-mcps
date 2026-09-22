import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { CricApiError, currentMatches, formatMatch, matchInfo, searchSeries } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "cricapi-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "current_matches",
    {
      title: "Current matches",
      description: "Live and recent cricket matches with scores and venues.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(20).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ limit }) => {
      try {
        const rows = await currentMatches(limit)
        if (rows.length === 0) return text("No current matches.")
        return text(rows.map((m, i) => formatMatch(m, i)).join("\n\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "match_info",
    {
      title: "Match info",
      description: "One match: status, score, venue.",
      inputSchema: z.object({
        id: z.string().describe("Match id (use current_matches)"),
      }),
      annotations: READ_ONLY,
    },
    async ({ id }) => {
      try {
        return text(formatMatch(await matchInfo(id)))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "search_series",
    {
      title: "Search series",
      description: "Cricket series and tournaments by name.",
      inputSchema: z.object({
        query: z.string().describe("Search text, e.g. 'Ashes', 'IPL'"),
        limit: z.number().int().min(1).max(20).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => {
      try {
        const rows = await searchSeries(query, limit)
        if (rows.length === 0) return text(`No series for "${query}".`)
        return text(rows.map((s, i) => `${i + 1}. ${s}`).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof CricApiError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
