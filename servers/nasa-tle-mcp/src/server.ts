import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { satellite } from "./api.js"
import { search } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "nasa-tle-mcp", version: "1.0.0" })
  server.registerTool(
    "satellite",
    {
      title: "Satellite",
      description: "Get TLE for a satellite by id.",
      inputSchema: z.object( { satid: z.number().describe("NORAD catalog id.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await satellite(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "search",
    {
      title: "Search",
      description: "Search satellites by name.",
      inputSchema: z.object( { query: z.string().describe("Name search query.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await search(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
