import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { accession } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "uniprot-mcp", version: "1.0.0" })
  server.tool("accession", "Details for a UniProt accession.", { accession: z.string().describe("Accession like P12345.") }, async (args) => {
    try { return text(await accession(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search", "Search UniProt by text.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
