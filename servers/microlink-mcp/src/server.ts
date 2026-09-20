import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { preview } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "microlink-mcp", version: "1.0.0" })
  server.registerTool(
    "preview",
    {
      title: "Preview",
      description: "Get a link preview.",
      inputSchema: z.object( { url: z.string().describe("Target URL.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await preview(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
