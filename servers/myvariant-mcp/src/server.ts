import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { get } from "./api.js"
import { query } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "myvariant-mcp", version: "1.0.0" })
  server.registerTool(
    "query",
    {
      title: "Query",
      description: "Query variants.",
      inputSchema: z.object( { q: z.string().describe("Variant query (e.g. chr7:g.140453136A>T)."), size: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await query(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "get",
    {
      title: "Get",
      description: "Get a variant by id.",
      inputSchema: z.object( { id: z.string().describe("Variant id.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await get(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
