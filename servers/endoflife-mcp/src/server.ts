import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { allProducts } from "./api.js"
import { productCycles } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "endoflife-mcp", version: "1.0.0" })
  server.registerTool(
    "product_cycles",
    {
      title: "Product cycles",
      description: "Release and EOL dates for a product.",
      inputSchema: z.object( { product: z.string().describe("Product name like nodejs or python.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await productCycles(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "all_products",
    {
      title: "All products",
      description: "List all tracked products.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await allProducts(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
