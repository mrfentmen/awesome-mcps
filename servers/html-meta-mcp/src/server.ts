import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { meta } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "html-meta-mcp", version: "1.0.0" })
  server.registerTool(
    "meta",
    {
      title: "Meta",
      description: "Meta and open graph tags for a URL.",
      inputSchema: z.object( { url: z.string().describe("URL to inspect.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await meta(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
