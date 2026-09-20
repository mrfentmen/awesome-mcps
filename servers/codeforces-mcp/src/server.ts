import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { contests } from "./api.js"
import { user } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "codeforces-mcp", version: "1.0.0" })
  server.registerTool(
    "contests",
    {
      title: "Contests",
      description: "List upcoming and recent contests.",
      inputSchema: z.object( { limit: z.number().describe("Max contests.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await contests(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "user",
    {
      title: "User",
      description: "Get user info by handle.",
      inputSchema: z.object( { handle: z.string().describe("Codeforces handle.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await user(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
