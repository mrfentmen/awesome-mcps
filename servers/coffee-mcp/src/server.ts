import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { hot } from "./api.js"
import { iced } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "coffee-mcp", version: "1.0.0" })
  server.registerTool(
    "hot",
    {
      title: "Hot",
      description: "Hot coffee drinks.",
      inputSchema: z.object( { limit: z.number().describe("Maximum results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await hot(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "iced",
    {
      title: "Iced",
      description: "Iced coffee drinks.",
      inputSchema: z.object( { limit: z.number().describe("Maximum results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await iced(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "search",
    {
      title: "Search",
      description: "Search drinks by keyword.",
      inputSchema: z.object( { query: z.string().describe("Keyword."), limit: z.number().describe("Maximum results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await search(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
