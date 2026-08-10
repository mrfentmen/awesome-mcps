import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { search } from "./api.js"
import { verse } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "bible-mcp", version: "1.0.0" })
  server.tool("verse", "Get a verse or passage by reference.", { reference: z.string().describe("Reference like John 3:16.") }, async (args) => {
    try { return text(await verse(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search", "Search the Bible for a phrase.", { query: z.string().describe("Phrase to search."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
