import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { inspectUrl } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "http-inspector-mcp", version: "1.0.0" })
  server.registerTool(
    "inspect_url",
    {
      title: "Inspect url",
      description: "Fetch a URL and report status and headers.",
      inputSchema: z.object( { url: z.string().describe("The URL to inspect.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await inspectUrl(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
