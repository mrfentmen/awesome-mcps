import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { search } from "./api.js"
import { show } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "episodate-mcp", version: "1.0.0" })
  server.tool("search", "Search TV shows.", { query: z.string().describe("Show name.") }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("show", "Get show details by id.", { id: z.number().describe("Show id.") }, async (args) => {
    try { return text(await show(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
