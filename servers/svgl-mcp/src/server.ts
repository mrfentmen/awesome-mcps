import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { categories } from "./api.js"
import { logos } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "svgl-mcp", version: "1.0.0" })
  server.tool("logos", "List logos.", { category: z.string().describe("Optional category filter.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await logos(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("categories", "List categories.", {  }, async (args) => {
    try { return text(await categories(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
