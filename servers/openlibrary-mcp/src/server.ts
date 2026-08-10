import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { search } from "./api.js"
import { work } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "openlibrary-mcp", version: "1.0.0" })
  server.tool("search", "Search books by text.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("work", "Details for one book work.", { key: z.string().describe("Work key like OL123W.") }, async (args) => {
    try { return text(await work(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
