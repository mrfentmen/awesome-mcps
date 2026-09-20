import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { popular } from "./api.js"
import { user } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "listenbrainz-mcp", version: "1.0.0" })
  server.registerTool(
    "user",
    {
      title: "User",
      description: "Recent listens for a user.",
      inputSchema: z.object( { username: z.string().describe("ListenBrainz username."), count: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await user(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "popular",
    {
      title: "Popular",
      description: "Top artists for a user.",
      inputSchema: z.object( { username: z.string().describe("ListenBrainz username.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await popular(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
