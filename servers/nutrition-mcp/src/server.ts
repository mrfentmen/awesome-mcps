import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { searchFood } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "nutrition-mcp", version: "1.0.0" })
  server.tool("search_food", "Search foods by name and get nutrition facts.", { query: z.string().describe("Food name like banana."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await searchFood(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
