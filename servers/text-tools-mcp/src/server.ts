import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { base64 } from "./api.js"
import { slugify } from "./api.js"
import { toCase } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "text-tools-mcp", version: "1.0.0" })
  server.registerTool(
    "slugify",
    {
      title: "Slugify",
      description: "Turn text into a URL slug.",
      inputSchema: z.object( { text: z.string().describe("Text to slugify.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await slugify(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "to_case",
    {
      title: "To case",
      description: "Convert text to a case.",
      inputSchema: z.object( { text: z.string().describe("Input text."), style: z.string().describe("camel, snake, kebab, or title.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await toCase(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "base64",
    {
      title: "Base64",
      description: "Encode or decode base64.",
      inputSchema: z.object( { text: z.string().describe("Input text."), decode: z.boolean().describe("Decode instead of encode.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await base64(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
