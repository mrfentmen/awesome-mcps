import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { users } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "randomuser-mcp", version: "1.0.0" })
  server.tool("users", "Random user profiles.", { count: z.number().describe("Number of users.").optional() }, async (args) => {
    try { return text(await users(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
