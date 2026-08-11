import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { object } from "./api.js"
import { objects } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "restful-api-dev-mcp", version: "1.0.0" })
  server.tool("objects", "List test objects.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await objects(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("object", "Get one object.", { id: z.string().describe("Object id.") }, async (args) => {
    try { return text(await object(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
