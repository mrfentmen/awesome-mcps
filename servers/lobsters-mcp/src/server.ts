import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { newest } from "./api.js"
import { top } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "lobsters-mcp", version: "1.0.0" })
  server.registerTool(
    "newest",
    {
      title: "Newest",
      description: "Newest stories on Lobsters.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await newest(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "top",
    {
      title: "Top",
      description: "Top stories on Lobsters.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await top(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
