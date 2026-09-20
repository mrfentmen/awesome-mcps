import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { products } from "./api.js"
import { recipes } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "dummyjson-mcp", version: "1.0.0" })
  server.registerTool(
    "products",
    {
      title: "Products",
      description: "List products.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await products(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "recipes",
    {
      title: "Recipes",
      description: "List recipes.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await recipes(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
