import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { object } from "./api.js"
import { objects } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "restful-api-dev-mcp", version: "1.0.0" })
  server.registerTool(
    "objects",
    {
      title: "Objects",
      description: "List test objects.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await objects(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "object",
    {
      title: "Object",
      description: "Get one object.",
      inputSchema: z.object( { id: z.string().describe("Object id.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await object(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
