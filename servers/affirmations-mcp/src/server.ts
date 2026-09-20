import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { many } from "./api.js"
import { random } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "affirmations-mcp", version: "1.0.0" })
  server.registerTool(
    "random",
    {
      title: "Random",
      description: "One random affirmation.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await random(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "many",
    {
      title: "Many",
      description: "Several affirmations.",
      inputSchema: z.object( { count: z.number().describe("How many.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await many(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
