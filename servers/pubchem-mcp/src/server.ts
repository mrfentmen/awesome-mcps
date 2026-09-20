import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { compound } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "pubchem-mcp", version: "1.0.0" })
  server.registerTool(
    "compound",
    {
      title: "Compound",
      description: "Properties for a compound by name.",
      inputSchema: z.object( { name: z.string().describe("Compound name like aspirin.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await compound(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "search",
    {
      title: "Search",
      description: "Find compound names matching a query.",
      inputSchema: z.object( { query: z.string().describe("Name fragment."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await search(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
