import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { generate } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "lorem-mcp", version: "1.0.0" })
  server.registerTool(
    "generate",
    {
      title: "Generate",
      description: "Generate lorem ipsum text.",
      inputSchema: z.object( { paragraphs: z.number().describe("Number of paragraphs.").optional(), words_per_paragraph: z.number().describe("Words per paragraph.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await generate(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
