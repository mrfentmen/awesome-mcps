import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { headings } from "./api.js"
import { toHtml } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "markdown-mcp", version: "1.0.0" })
  server.registerTool(
    "to_html",
    {
      title: "To html",
      description: "Convert markdown to HTML.",
      inputSchema: z.object( { markdown: z.string().describe("Markdown text.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await toHtml(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "headings",
    {
      title: "Headings",
      description: "Extract the heading outline from markdown.",
      inputSchema: z.object( { markdown: z.string().describe("Markdown text.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await headings(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
