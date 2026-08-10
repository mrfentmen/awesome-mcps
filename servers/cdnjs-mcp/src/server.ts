import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { library } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "cdnjs-mcp", version: "1.0.0" })
  server.tool("search", "Search cdnjs libraries.", { query: z.string().describe("Search terms."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("library", "Details for one library.", { name: z.string().describe("Library name like react.") }, async (args) => {
    try { return text(await library(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
