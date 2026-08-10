import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { article } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "pubmed-mcp", version: "1.0.0" })
  server.tool("search", "Search PubMed for articles matching a query.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("article", "Fetch the summary for one PubMed article.", { pmid: z.string().describe("PubMed ID.") }, async (args) => {
    try { return text(await article(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
