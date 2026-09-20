import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { convert } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "html-to-markdown-mcp", version: "1.0.0" })
  server.registerTool(
    "convert",
    {
      title: "Convert",
      description: "Convert HTML to markdown.",
      inputSchema: z.object( { html: z.string().describe("HTML text."), max_length: z.number().describe("Max output length.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await convert(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
