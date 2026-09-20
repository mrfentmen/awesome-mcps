import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { properties } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "rxnav-mcp", version: "1.0.0" })
  server.registerTool(
    "search",
    {
      title: "Search",
      description: "Find drug candidates matching a term.",
      inputSchema: z.object( { term: z.string().describe("Drug name like lipitor.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await search(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "properties",
    {
      title: "Properties",
      description: "Properties for an RxNorm identifier.",
      inputSchema: z.object( { rxcui: z.string().describe("RxNorm identifier.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await properties(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
