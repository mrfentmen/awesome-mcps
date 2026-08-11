import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { contests } from "./api.js"
import { user } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "codeforces-mcp", version: "1.0.0" })
  server.tool("contests", "List upcoming and recent contests.", { limit: z.number().describe("Max contests.").optional() }, async (args) => {
    try { return text(await contests(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("user", "Get user info by handle.", { handle: z.string().describe("Codeforces handle.") }, async (args) => {
    try { return text(await user(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
