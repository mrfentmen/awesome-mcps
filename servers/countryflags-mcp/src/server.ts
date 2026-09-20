import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { flag } from "./api.js"
import { list } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "countryflags-mcp", version: "1.0.0" })
  server.registerTool(
    "list",
    {
      title: "List",
      description: "List country flag codes.",
      inputSchema: z.object( { search: z.string().describe("Optional search terms.").optional(), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await list(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "flag",
    {
      title: "Flag",
      description: "Flag image URL for a country.",
      inputSchema: z.object( { code: z.string().describe("Country code like us.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await flag(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
