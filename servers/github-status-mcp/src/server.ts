import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { incidents } from "./api.js"
import { status } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "github-status-mcp", version: "1.0.0" })
  server.registerTool(
    "status",
    {
      title: "Status",
      description: "Current GitHub status.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await status(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "incidents",
    {
      title: "Incidents",
      description: "Recent incidents.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await incidents(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
