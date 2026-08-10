import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { meta } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "html-meta-mcp", version: "1.0.0" })
  server.tool("meta", "Meta and open graph tags for a URL.", { url: z.string().describe("URL to inspect.") }, async (args) => {
    try { return text(await meta(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
