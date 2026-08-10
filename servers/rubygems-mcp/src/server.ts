import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { gemInfo } from "./api.js"
import { searchGems } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "rubygems-mcp", version: "1.0.0" })
  server.tool("gem_info", "Get details for a Ruby gem.", { name: z.string().describe("Gem name.") }, async (args) => {
    try { return text(await gemInfo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search_gems", "Search gems.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchGems(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
