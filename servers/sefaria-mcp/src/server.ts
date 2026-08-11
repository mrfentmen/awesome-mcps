import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { getText } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "sefaria-mcp", version: "1.0.0" })
  server.tool("text", "Get a text section.", { ref: z.string().describe("Ref like Genesis.1.") }, async (args) => {
    try { return text(await getText(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
