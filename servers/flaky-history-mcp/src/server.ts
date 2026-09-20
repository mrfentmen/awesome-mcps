import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { analyzeHistory, format } from "./history.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const errorText = (error: unknown) => text(`Error: ${error instanceof Error ? error.message : String(error)}`)

export function createServer() {
  const server = new McpServer({ name: "flaky-history-mcp", version: "1.0.0" })
  server.registerTool(
    "analyze_test_history",
    {
      title: "Analyze test history",
      description: "Aggregate local test history into stability signals without returning test names, file names, raw records, or exact versions.",
      inputSchema: z.object(
    { project: z.string().min(1).max(1000).describe("Local project directory; no URLs") }),
      annotations: READ_ONLY,
    },
    async ({ project }) => {
      try { return text(format(await analyzeHistory(project))) } catch (error) { return errorText(error) }
    }
  )
  return server
}
