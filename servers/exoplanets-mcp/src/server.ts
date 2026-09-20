import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { byName } from "./api.js"
import { recent } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "exoplanets-mcp", version: "1.0.0" })
  server.registerTool(
    "recent",
    {
      title: "Recent",
      description: "Recently confirmed exoplanets.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await recent(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "by_name",
    {
      title: "By name",
      description: "Look up an exoplanet by name.",
      inputSchema: z.object( { name: z.string().describe("Planet name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await byName(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
