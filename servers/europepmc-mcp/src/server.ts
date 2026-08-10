import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { article } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "europepmc-mcp", version: "1.0.0" })
  server.tool("search", "Search Europe PMC articles.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("article", "One article by ID and source.", { extId: z.string().describe("Article ID like 32534363."), source: z.string().describe("Source like MED or PMC.").optional() }, async (args) => {
    try { return text(await article(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
