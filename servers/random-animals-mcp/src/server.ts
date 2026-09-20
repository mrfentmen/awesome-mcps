import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { animal } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "random-animals-mcp", version: "1.0.0" })
  server.registerTool(
    "animal",
    {
      title: "Animal",
      description: "A random animal photo with a fact.",
      inputSchema: z.object( { type: z.string().describe("dog, cat, fox, bird, panda, koala, duck.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await animal(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
