import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { posts } from "./api.js"
import { todos } from "./api.js"
import { users } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "jsonplaceholder-mcp", version: "1.0.0" })
  server.registerTool(
    "todos",
    {
      title: "Todos",
      description: "List todos.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await todos(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "posts",
    {
      title: "Posts",
      description: "List posts.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await posts(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "users",
    {
      title: "Users",
      description: "List users.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await users(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
