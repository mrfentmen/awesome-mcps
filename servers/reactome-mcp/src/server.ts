import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatHit, formatPathway, getPathway, ReactomeError, searchPathways } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "reactome-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_pathways",
    {
      title: "Search pathways",
      description: "Search Reactome for biological pathways, reactions, and molecules by keyword.",
      inputSchema: z.object({
        query: z.string().describe("Search text, e.g. 'apoptosis', 'BRCA1', 'glycolysis'"),
        limit: z.number().int().min(1).max(20).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => {
      try {
        const results = await searchPathways(query, limit)
        if (results.length === 0) return text(`No Reactome pathways match "${query}".`)
        return text(`Reactome results for "${query}":\n\n${results.map((h, i) => formatHit(h, i)).join("\n")}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_pathway",
    {
      title: "Get pathway details",
      description: "Get a Reactome pathway by stable id: summary, species, compartments, literature, diagram link.",
      inputSchema: z.object({
        stId: z.string().describe("Stable id, e.g. 'R-HSA-109581' (use search_pathways to find it)"),
      }),
      annotations: READ_ONLY,
    },
    async ({ stId }) => {
      try {
        const p = await getPathway(stId)
        if (!p) return text(`No Reactome pathway ${stId}.`)
        return text(formatPathway(p))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof ReactomeError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
