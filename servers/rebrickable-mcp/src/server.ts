import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatSet, getSet, RebrickableError, searchSets, setParts } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "rebrickable-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_sets",
    {
      title: "Search sets",
      description: "LEGO sets by keyword with years and part counts.",
      inputSchema: z.object({
        query: z.string().describe("Search text, e.g. 'Millennium Falcon'"),
        limit: z.number().int().min(1).max(100).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => {
      try {
        const rows = await searchSets(query, limit)
        if (rows.length === 0) return text(`No LEGO sets for "${query}".`)
        return text(rows.map((s, i) => formatSet(s, i)).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_set",
    {
      title: "Get set",
      description: "One LEGO set with part count and link.",
      inputSchema: z.object({
        number: z.string().describe("Set number, e.g. '75192-1' (use search_sets)"),
      }),
      annotations: READ_ONLY,
    },
    async ({ number }) => {
      try {
        return text(await getSet(number))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "set_parts",
    {
      title: "Set parts",
      description: "Parts inventory of one set with colors and quantities.",
      inputSchema: z.object({
        number: z.string().describe("Set number, e.g. '75192-1'"),
        limit: z.number().int().min(1).max(100).default(10),
      }),
      annotations: READ_ONLY,
    },
    async ({ number, limit }) => {
      try {
        const rows = await setParts(number, limit)
        if (rows.length === 0) return text(`No parts for set ${number}.`)
        return text(rows.map((p, i) => `${i + 1}. ${p}`).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof RebrickableError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
