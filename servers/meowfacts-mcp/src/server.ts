import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { fact } from "./api.js"
import { many } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "meowfacts-mcp", version: "1.0.0" })
  server.registerTool(
    "fact",
    {
      title: "Fact",
      description: "One random cat fact.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await fact(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "many",
    {
      title: "Many",
      description: "Several cat facts.",
      inputSchema: z.object( { count: z.number().describe("How many facts.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await many(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
