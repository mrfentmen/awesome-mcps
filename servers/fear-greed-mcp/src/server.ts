import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { current } from "./api.js"
import { history } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "fear-greed-mcp", version: "1.0.0" })
  server.registerTool(
    "current",
    {
      title: "Current",
      description: "The current fear and greed index.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await current(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "history",
    {
      title: "History",
      description: "Recent fear and greed index values.",
      inputSchema: z.object( { days: z.number().describe("How many days back.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await history(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
