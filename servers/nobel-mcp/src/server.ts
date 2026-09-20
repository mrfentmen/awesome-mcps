import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { laureates } from "./api.js"
import { prizes } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "nobel-mcp", version: "1.0.0" })
  server.registerTool(
    "laureates",
    {
      title: "Laureates",
      description: "List Nobel laureates, optionally by year.",
      inputSchema: z.object( { year: z.number().describe("Prize year.").optional(), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await laureates(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "prizes",
    {
      title: "Prizes",
      description: "List Nobel prizes by year.",
      inputSchema: z.object( { year: z.number().describe("Prize year.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await prizes(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
