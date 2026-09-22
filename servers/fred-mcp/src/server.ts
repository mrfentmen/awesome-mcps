import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatSeries, FredError, searchSeries, seriesObservations } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "fred-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_series",
    {
      title: "Search series",
      description: "Search FRED economic series (GDP, unemployment, CPI...) by keyword.",
      inputSchema: z.object({
        query: z.string().describe("Search text, e.g. 'unemployment rate'"),
        limit: z.number().int().min(1).max(100).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => {
      try {
        const rows = await searchSeries(query, limit)
        if (rows.length === 0) return text(`No FRED series for "${query}".`)
        return text(rows.map((s, i) => formatSeries(s, i)).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "series_observations",
    {
      title: "Series observations",
      description: "Latest values of a FRED series, newest first.",
      inputSchema: z.object({
        id: z.string().describe("Series id, e.g. 'UNRATE' (use search_series)"),
        limit: z.number().int().min(1).max(100).default(12),
      }),
      annotations: READ_ONLY,
    },
    async ({ id, limit }) => {
      try {
        return text(await seriesObservations(id, limit))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof FredError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
