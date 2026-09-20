import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { getText } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "sefaria-mcp", version: "1.0.0" })
  server.registerTool(
    "text",
    {
      title: "Text",
      description: "Get a text section.",
      inputSchema: z.object( { ref: z.string().describe("Ref like Genesis.1.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await getText(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
