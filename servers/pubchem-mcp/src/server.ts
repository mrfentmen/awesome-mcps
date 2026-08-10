import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { compound } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "pubchem-mcp", version: "1.0.0" })
  server.tool("compound", "Properties for a compound by name.", { name: z.string().describe("Compound name like aspirin.") }, async (args) => {
    try { return text(await compound(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("search", "Find compound names matching a query.", { query: z.string().describe("Name fragment."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
