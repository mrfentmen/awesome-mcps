import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { candidateSummary, formatCandidate, OpenSecretsError, searchCandidates } from "./api.js"

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })

const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const

export function createServer(): McpServer {
  const server = new McpServer({
    name: "opensecrets-mcp",
    version: "1.0.0",
  })

  server.registerTool(
    "search_candidates",
    {
      title: "Search candidates",
      description: "Find federal candidates by name fragment: party, state, chamber, CRP id.",
      inputSchema: z.object({
        query: z.string().describe("Name fragment, e.g. 'Smith'"),
      }),
      annotations: READ_ONLY,
    },
    async ({ query }) => {
      try {
        const rows = await searchCandidates(query)
        if (rows.length === 0) return text(`No candidates match "${query}".`)
        return text(rows.map((c, i) => formatCandidate(c, i)).join("\n"))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  server.registerTool(
    "candidate_summary",
    {
      title: "Money summary",
      description: "Raised, spent, cash on hand and debt for one candidate and cycle.",
      inputSchema: z.object({
        cid: z.string().describe("CRP candidate id, e.g. 'N00007360' (use search_candidates)"),
        cycle: z.string().default("2024").describe("Election cycle, e.g. '2024'"),
      }),
      annotations: READ_ONLY,
    },
    async ({ cid, cycle }) => {
      try {
        return text(await candidateSummary(cid, cycle))
      } catch (e) {
        return textError(errorMessage(e))
      }
    }
  )

  return server
}

function errorMessage(e: unknown): string {
  if (e instanceof OpenSecretsError) return `Error: ${e.message}`
  if (e instanceof Error) return `Error: ${e.message}`
  return `Error: ${String(e)}`
}
