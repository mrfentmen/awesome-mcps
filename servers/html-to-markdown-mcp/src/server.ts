import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { convert } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "html-to-markdown-mcp", version: "1.0.0" })
  server.tool("convert", "Convert HTML to markdown.", { html: z.string().describe("HTML text."), max_length: z.number().describe("Max output length.").optional() }, async (args) => {
    try { return text(await convert(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
