import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { get } from "./api.js"
import { query } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "myvariant-mcp", version: "1.0.0" })
  server.tool("query", "Query variants.", { q: z.string().describe("Variant query (e.g. chr7:g.140453136A>T)."), size: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await query(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("get", "Get a variant by id.", { id: z.string().describe("Variant id.") }, async (args) => {
    try { return text(await get(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
