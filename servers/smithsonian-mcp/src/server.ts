import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatObject, searchObjects, SmithsonianError } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "smithsonian-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_objects",
    {
      title: "Search collections",
      description: "Smithsonian artifacts, art, and specimens by keyword.",
      inputSchema: z.object({
        query: z.string().describe("Search text, e.g. 'Apollo 11', 'dinosaur'"),
        limit: z.number().int().min(1).max(100).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => {
      try {
        const rows = await searchObjects(query, limit)
        if (rows.length === 0) return text(`Nothing found for "${query}".`)
        return text(rows.map((o, i) => formatObject(o, i)).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof SmithsonianError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
