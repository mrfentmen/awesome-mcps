import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { app } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "steamspy-mcp", version: "1.0.0" })
  server.registerTool(
    "app",
    {
      title: "App",
      description: "Player statistics for one Steam app.",
      inputSchema: z.object( { appid: z.number().describe("Steam app id.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await app(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
