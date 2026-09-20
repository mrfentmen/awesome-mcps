import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { recentObservations } from "./api.js"
import { searchSpecies } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "inaturalist-mcp", version: "1.0.0" })
  server.registerTool(
    "search_species",
    {
      title: "Search species",
      description: "Search species by name.",
      inputSchema: z.object( { query: z.string().describe("Species name."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchSpecies(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "recent_observations",
    {
      title: "Recent observations",
      description: "Recent observations of a species.",
      inputSchema: z.object( { taxonId: z.number().describe("iNaturalist taxon ID."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await recentObservations(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
