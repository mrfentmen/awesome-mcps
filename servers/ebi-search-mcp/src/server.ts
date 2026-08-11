import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { entry } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ebi-search-mcp", version: "1.0.0" })
  server.tool("search", "Search a biomedical database.", { query: z.string().describe("Search query."), domain: z.string().describe("Database domain (ensembl, uniprot, literature).").optional(), size: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("entry", "Get a specific entry.", { domain: z.string().describe("Database domain."), id: z.string().describe("Entry id.") }, async (args) => {
    try { return text(await entry(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
