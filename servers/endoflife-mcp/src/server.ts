import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { allProducts } from "./api.js"
import { productCycles } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "endoflife-mcp", version: "1.0.0" })
  server.tool("product_cycles", "Release and EOL dates for a product.", { product: z.string().describe("Product name like nodejs or python.") }, async (args) => {
    try { return text(await productCycles(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("all_products", "List all tracked products.", {  }, async (args) => {
    try { return text(await allProducts(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
