import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { entry } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ebi-search-mcp", version: "1.0.0" })
  server.registerTool(
    "search",
    {
      title: "Search",
      description: "Search a biomedical database.",
      inputSchema: z.object( { query: z.string().describe("Search query."), domain: z.string().describe("Database domain (ensembl, uniprot, literature).").optional(), size: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await search(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "entry",
    {
      title: "Entry",
      description: "Get a specific entry.",
      inputSchema: z.object( { domain: z.string().describe("Database domain."), id: z.string().describe("Entry id.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await entry(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
