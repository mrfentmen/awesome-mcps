import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatRecord, searchRecords, TroveError } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "trove-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_records",
    {
      title: "Search Trove",
      description: "Australian books, newspapers, images, music and more by keyword.",
      inputSchema: z.object({
        query: z.string().describe("Search text, e.g. 'ned kelly', 'sydney harbour'"),
        category: z.string().default("all").describe("Category like 'book', 'newspaper', 'image', empty/all = all"),
        limit: z.number().int().min(1).max(100).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, category, limit }) => {
      try {
        const rows = await searchRecords(query, category, limit)
        if (rows.length === 0) return text(`Nothing found for "${query}".`)
        return text(rows.map((r, i) => formatRecord(r, i)).join("\n\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof TroveError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
