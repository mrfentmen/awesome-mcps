import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { newest } from "./api.js"
import { top } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "lobsters-mcp", version: "1.0.0" })
  server.tool("newest", "Newest stories on Lobsters.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await newest(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("top", "Top stories on Lobsters.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await top(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
