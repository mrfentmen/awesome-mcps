import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { summary } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "protondb-mcp", version: "1.0.0" })
  server.registerTool(
    "summary",
    {
      title: "Summary",
      description: "Proton compatibility summary for a Steam app.",
      inputSchema: z.object( { appid: z.number().describe("Steam app id.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await summary(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
