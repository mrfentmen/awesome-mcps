import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { hot } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "openwhyd-mcp", version: "1.0.0" })
  server.tool("hot", "Hot tracks on OpenWhyd.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await hot(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
