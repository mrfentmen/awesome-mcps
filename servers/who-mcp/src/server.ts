import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { indicator } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "who-mcp", version: "1.0.0" })
  server.tool("indicator", "Values for a WHO indicator.", { code: z.string().describe("Indicator code like WHOSIS_000001."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await indicator(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search", "Search WHO indicators by text.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
