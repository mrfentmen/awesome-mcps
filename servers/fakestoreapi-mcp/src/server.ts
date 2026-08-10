import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { categories } from "./api.js"
import { product } from "./api.js"
import { products } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "fakestoreapi-mcp", version: "1.0.0" })
  server.tool("products", "List products.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await products(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("product", "Get a product by id.", { id: z.number().describe("Product id.") }, async (args) => {
    try { return text(await product(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("categories", "List product categories.", {  }, async (args) => {
    try { return text(await categories(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
