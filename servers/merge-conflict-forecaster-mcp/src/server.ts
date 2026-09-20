import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { format, forecast } from "./forecaster.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const errorText = (error: unknown) => text(`Error: ${error instanceof Error ? error.message : "Local merge forecast failed"}`)

export function createServer() {
  const server = new McpServer({ name: "merge-conflict-forecaster-mcp", version: "1.0.0" })
  server.registerTool(
    "forecast_merge_conflicts",
    {
      title: "Forecast merge conflicts",
      description: "Estimate local Git merge-conflict pressure from branch topology and changed-file overlap without returning source content.",
      inputSchema: z.object(
    {
      cwd: z.string().min(1).max(1000).default(".").describe("Local Git repository path inside the configured workspace; no network access is used."),
      base: z.string().min(1).max(300).optional().describe("Optional local branch name used as the comparison base."),
      limit: z.number().int().min(1).max(40).default(20).describe("Maximum number of local branches to analyze."),
    }),
      annotations: READ_ONLY,
    },
    async (input) => {
      try { return text(format(await forecast(input))) } catch (error) { return errorText(error) }
    }
  )
  return server
}
