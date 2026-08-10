import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { popular } from "./api.js"
import { user } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "listenbrainz-mcp", version: "1.0.0" })
  server.tool("user", "Recent listens for a user.", { username: z.string().describe("ListenBrainz username."), count: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await user(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("popular", "Top artists for a user.", { username: z.string().describe("ListenBrainz username.") }, async (args) => {
    try { return text(await popular(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
