import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { lei } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "gleif-mcp", version: "1.0.0" })
  server.tool("search", "Search legal entities.", { query: z.string().describe("Entity name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("lei", "Get a record by LEI.", { id: z.string().describe("LEI code.") }, async (args) => {
    try { return text(await lei(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
