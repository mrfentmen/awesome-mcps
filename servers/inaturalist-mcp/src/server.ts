import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { recentObservations } from "./api.js"
import { searchSpecies } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "inaturalist-mcp", version: "1.0.0" })
  server.tool("search_species", "Search species by name.", { query: z.string().describe("Species name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchSpecies(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("recent_observations", "Recent observations of a species.", { taxonId: z.number().describe("iNaturalist taxon ID."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await recentObservations(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
