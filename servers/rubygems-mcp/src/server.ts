import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { gemInfo } from "./api.js"
import { searchGems } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "rubygems-mcp", version: "1.0.0" })
  server.registerTool(
    "gem_info",
    {
      title: "Gem info",
      description: "Get details for a Ruby gem.",
      inputSchema: z.object( { name: z.string().describe("Gem name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await gemInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "search_gems",
    {
      title: "Search gems",
      description: "Search gems.",
      inputSchema: z.object( { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await searchGems(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
