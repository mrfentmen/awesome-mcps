import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatCase, formatHit, getCase, OyezError, searchCases } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "oyez-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_cases",
    {
      title: "Search SCOTUS cases",
      description: "Search Oyez for Supreme Court cases by name or topic.",
      inputSchema: z.object({
        query: z.string().describe("Search text, e.g. 'roe', 'miranda', 'free speech'"),
        limit: z.number().int().min(1).max(20).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => {
      try {
        const results = await searchCases(query, limit)
        if (results.length === 0) return text(`No Oyez cases match "${query}".`)
        return text(`Oyez cases for "${query}":\n\n${results.map((h, i) => formatHit(h, i)).join("\n")}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_case",
    {
      title: "Get case details",
      description: "Get a Supreme Court case: parties, question, conclusion, decisions, oral-argument audio.",
      inputSchema: z.object({
        term: z.string().describe("Term year, e.g. '2022' (use search_cases to find it)"),
        docket: z.string().describe("Docket number, e.g. '21-857'"),
      }),
      annotations: READ_ONLY,
    },
    async ({ term, docket }) => {
      try {
        return text(formatCase(await getCase(term, docket)))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof OyezError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
