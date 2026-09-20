import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { diffText } from "./api.js"
import { unifiedDiff } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "diff-mcp", version: "1.0.0" })
  server.registerTool(
    "diff_text",
    {
      title: "Diff text",
      description: "Show the diff between two texts.",
      inputSchema: z.object( { a: z.string().describe("Original text."), b: z.string().describe("New text.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await diffText(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "unified_diff",
    {
      title: "Unified diff",
      description: "Show a unified diff between two texts.",
      inputSchema: z.object( { a: z.string().describe("Original text."), b: z.string().describe("New text."), context: z.number().describe("Context lines.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await unifiedDiff(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
