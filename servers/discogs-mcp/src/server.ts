import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { release } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "discogs-mcp", version: "1.0.0" })
  server.tool("search", "Search releases.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("release", "Get a release by id.", { id: z.number().describe("Release id.") }, async (args) => {
    try { return text(await release(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
