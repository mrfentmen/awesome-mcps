import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { headings } from "./api.js"
import { toHtml } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "markdown-mcp", version: "1.0.0" })
  server.tool("to_html", "Convert markdown to HTML.", { markdown: z.string().describe("Markdown text.") }, async (args) => {
    try { return text(await toHtml(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("headings", "Extract the heading outline from markdown.", { markdown: z.string().describe("Markdown text.") }, async (args) => {
    try { return text(await headings(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
