import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { products } from "./api.js"
import { recipes } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "dummyjson-mcp", version: "1.0.0" })
  server.tool("products", "List products.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await products(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("recipes", "List recipes.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await recipes(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
