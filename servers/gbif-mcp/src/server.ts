import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { format, match, occurrences, species, GbifError } from "./api.js"
const text = (s: string) => ({ content: [{ type: "text" as const, text: s }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
export function createServer() { const server = new McpServer({ name: "gbif-mcp", version: "1.0.0" }); server.registerTool(
    "match_species",
    {
      title: "Match species",
      description: "Match a scientific or common name to GBIF taxonomy.",
      inputSchema: z.object( { name: z.string().min(1) }),
      annotations: READ_ONLY,
    },
    async ({ name }) => { try { return text(format(await match(name))) } catch (e) { return textError(`Error: ${e instanceof Error ? e.message : String(e)}`) } }
  ); server.registerTool(
    "get_species",
    {
      title: "Get species",
      description: "Get GBIF taxonomy metadata by usage key.",
      inputSchema: z.object( { key: z.string().min(1) }),
      annotations: READ_ONLY,
    },
    async ({ key }) => { try { return text(format(await species(key))) } catch (e) { return textError(`Error: ${e instanceof Error ? e.message : String(e)}`) } }
  ); server.registerTool(
    "search_occurrences",
    {
      title: "Search occurrences",
      description: "Search public biodiversity observations by taxon, country, year, or bounding box.",
      inputSchema: z.object( { taxonKey: z.string().optional(), country: z.string().length(2).optional(), year: z.string().optional(), geometry: z.string().optional(), limit: z.number().int().min(1).max(100).default(20) }),
      annotations: READ_ONLY,
    },
    async ({ taxonKey, country, year, geometry, limit }) => { try { return text(format(await occurrences({ ...(taxonKey ? { taxonKey } : {}), ...(country ? { country } : {}), ...(year ? { year } : {}), ...(geometry ? { geometry } : {}), limit: String(limit) }))) } catch (e) { return textError(`Error: ${e instanceof Error ? e.message : String(e)}`) } }
  ); return server }
export { GbifError }
