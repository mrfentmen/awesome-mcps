import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { badge } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "shields-mcp", version: "1.0.0" })
  server.registerTool(
    "badge",
    {
      title: "Badge",
      description: "Build a badge URL.",
      inputSchema: z.object( { label: z.string().describe("Label text."), message: z.string().describe("Message text."), color: z.string().describe("Color like green.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await badge(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
