import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { browse } from "./api.js"
import { object } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "jpl-sbdb-mcp", version: "1.0.0" })
  server.registerTool(
    "object",
    {
      title: "Object",
      description: "Small body by designation or name.",
      inputSchema: z.object( { name: z.string().describe("Designation like 1P or 433.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await object(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "browse",
    {
      title: "Browse",
      description: "Browse small bodies.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await browse(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
