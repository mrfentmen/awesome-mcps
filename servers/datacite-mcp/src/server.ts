import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { doi } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "datacite-mcp", version: "1.0.0" })
  server.tool("search", "Search DOIs by query.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("doi", "Details for one DOI.", { doi: z.string().describe("DOI like 10.5281/zenodo.20501604.") }, async (args) => {
    try { return text(await doi(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
