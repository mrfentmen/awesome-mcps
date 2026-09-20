import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { template } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "gitignore-mcp", version: "1.0.0" })
  server.registerTool(
    "template",
    {
      title: "Template",
      description: "Get a gitignore template.",
      inputSchema: z.object( { name: z.string().describe("Template name like node.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await template(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
