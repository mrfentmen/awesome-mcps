import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { diffText } from "./api.js"
import { unifiedDiff } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "diff-mcp", version: "1.0.0" })
  server.tool("diff_text", "Show the diff between two texts.", { a: z.string().describe("Original text."), b: z.string().describe("New text.") }, async (args) => {
    try { return text(await diffText(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("unified_diff", "Show a unified diff between two texts.", { a: z.string().describe("Original text."), b: z.string().describe("New text."), context: z.number().describe("Context lines.").optional() }, async (args) => {
    try { return text(await unifiedDiff(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
