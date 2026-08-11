import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { preview } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "microlink-mcp", version: "1.0.0" })
  server.tool("preview", "Get a link preview.", { url: z.string().describe("Target URL.") }, async (args) => {
    try { return text(await preview(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
