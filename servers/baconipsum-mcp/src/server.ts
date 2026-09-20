import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { generate } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "baconipsum-mcp", version: "1.0.0" })
  server.registerTool(
    "generate",
    {
      title: "Generate",
      description: "Generate placeholder text.",
      inputSchema: z.object( { type: z.string().describe("meat-and-filler or all-meat.").optional(), sentences: z.number().describe("Number of sentences.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await generate(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
