import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { search } from "./api.js"
import { show } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "episodate-mcp", version: "1.0.0" })
  server.registerTool(
    "search",
    {
      title: "Search",
      description: "Search TV shows.",
      inputSchema: z.object( { query: z.string().describe("Show name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await search(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "show",
    {
      title: "Show",
      description: "Get show details by id.",
      inputSchema: z.object( { id: z.number().describe("Show id.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await show(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
