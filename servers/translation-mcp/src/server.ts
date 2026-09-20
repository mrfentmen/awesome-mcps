import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { detectAndTranslate } from "./api.js"
import { translate } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "translation-mcp", version: "1.0.0" })
  server.registerTool(
    "translate",
    {
      title: "Translate",
      description: "Translate text from a source to a target language.",
      inputSchema: z.object( { text: z.string().describe("Text to translate."), from: z.string().describe("Source language code.").optional(), to: z.string().describe("Target language code.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await translate(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "detect_and_translate",
    {
      title: "Detect and translate",
      description: "Translate text with automatic language detection.",
      inputSchema: z.object( { text: z.string().describe("Text to translate."), to: z.string().describe("Target language code.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await detectAndTranslate(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
