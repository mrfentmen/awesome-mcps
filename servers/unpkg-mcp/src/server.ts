import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { info } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "unpkg-mcp", version: "1.0.0" })
  server.registerTool(
    "info",
    {
      title: "Info",
      description: "Metadata for an npm package from unpkg.",
      inputSchema: z.object( { name: z.string().describe("Package name."), version: z.string().describe("Version.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await info(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
