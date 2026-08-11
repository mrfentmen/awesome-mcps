import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { get } from "./api.js"
import { query } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "mygene-mcp", version: "1.0.0" })
  server.tool("query", "Query genes.", { q: z.string().describe("Gene name, symbol, or keyword."), size: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await query(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("get", "Get a gene by id.", { id: z.string().describe("Gene id.") }, async (args) => {
    try { return text(await get(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
