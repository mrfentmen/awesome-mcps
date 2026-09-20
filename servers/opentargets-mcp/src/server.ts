import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatHit, formatTarget, getTarget, OpenTargetsError, searchEntities } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "opentargets-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search",
    {
      title: "Search genes, diseases, drugs",
      description: "Search Open Targets for genes (targets), diseases, and drugs.",
      inputSchema: z.object({
        query: z.string().describe("Search text, e.g. 'BRCA1', 'Alzheimer', 'aspirin'"),
        entity: z.enum(["target", "disease", "drug"]).default("target"),
        limit: z.number().int().min(1).max(25).default(5),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, entity, limit }) => {
      try {
        const results = await searchEntities(query, entity, limit)
        if (results.length === 0) return text(`No Open Targets ${entity}s match "${query}".`)
        return text(`Open Targets ${entity}s for "${query}":\n\n${results.map((h, i) => formatHit(h, i)).join("\n")}`)
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "get_target",
    {
      title: "Get gene details",
      description: "Get a gene target: functions, known drugs, top associated diseases with scores.",
      inputSchema: z.object({
        ensemblId: z.string().describe("Ensembl id, e.g. 'ENSG00000012048' for BRCA1 (use search to find it)"),
      }),
      annotations: READ_ONLY,
    },
    async ({ ensemblId }) => {
      try {
        const t = await getTarget(ensemblId)
        if (!t) return text(`No Open Targets gene ${ensemblId}.`)
        return text(formatTarget(t))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof OpenTargetsError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
