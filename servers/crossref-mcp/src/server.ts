import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { doiLookup } from "./api.js"
import { searchWorks } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "crossref-mcp", version: "1.0.0" })
  server.tool("search_works", "Search scholarly works.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchWorks(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("doi_lookup", "Resolve a DOI to its metadata.", { doi: z.string().describe("Digital Object Identifier.") }, async (args) => {
    try { return text(await doiLookup(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
