import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { instantAnswer } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "duckduckgo-mcp", version: "1.0.0" })
  server.tool("instant_answer", "Instant answer for a query.", { query: z.string().describe("The query.") }, async (args) => {
    try { return text(await instantAnswer(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
