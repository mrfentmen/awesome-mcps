import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { lei } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "gleif-mcp", version: "1.0.0" })
  server.registerTool(
    "search",
    {
      title: "Search",
      description: "Search legal entities.",
      inputSchema: z.object( { query: z.string().describe("Entity name."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await search(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "lei",
    {
      title: "Lei",
      description: "Get a record by LEI.",
      inputSchema: z.object( { id: z.string().describe("LEI code.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await lei(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
