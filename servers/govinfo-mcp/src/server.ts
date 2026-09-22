import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatHit, GovInfoError, listCollections, searchPublished } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "govinfo-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "list_collections",
    {
      title: "List collections",
      description: "GovInfo collections: bills, laws, Register, Record, and more.",
      inputSchema: z.object({}),
      annotations: READ_ONLY,
    },
    async () => {
      try {
        const rows = await listCollections()
        if (rows.length === 0) return text("No collections.")
        return text(rows.map((c, i) => `${i + 1}. [${c.code}] ${c.name ?? ""}`).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "search_published",
    {
      title: "Search publications",
      description: "Search published U.S. government documents by keyword.",
      inputSchema: z.object({
        query: z.string().describe("Search text, e.g. 'infrastructure', 'climate'"),
        collection: z.string().default("").describe("Collection code like 'BILLS', empty = all (use list_collections)"),
        limit: z.number().int().min(1).max(100).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, collection, limit }) => {
      try {
        const rows = await searchPublished(query, collection, limit)
        if (rows.length === 0) return text(`Nothing found for "${query}".`)
        return text(rows.map((h, i) => formatHit(h, i)).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof GovInfoError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
