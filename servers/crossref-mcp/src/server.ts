import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { doiLookup } from "./api.js"
import { searchWorks } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "crossref-mcp", version: "1.0.0" })
  server.registerTool(
    "search_works",
    {
      title: "Search works",
      description: "Search scholarly works.",
      inputSchema: z.object( { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchWorks(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "doi_lookup",
    {
      title: "Doi lookup",
      description: "Resolve a DOI to its metadata.",
      inputSchema: z.object( { doi: z.string().describe("Digital Object Identifier.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await doiLookup(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
