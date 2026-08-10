import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { posts } from "./api.js"
import { todos } from "./api.js"
import { users } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "jsonplaceholder-mcp", version: "1.0.0" })
  server.tool("todos", "List todos.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await todos(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("posts", "List posts.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await posts(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("users", "List users.", {  }, async (args) => {
    try { return text(await users(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
