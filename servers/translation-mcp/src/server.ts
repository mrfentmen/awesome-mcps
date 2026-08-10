import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { detectAndTranslate } from "./api.js"
import { translate } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "translation-mcp", version: "1.0.0" })
  server.tool("translate", "Translate text from a source to a target language.", { text: z.string().describe("Text to translate."), from: z.string().describe("Source language code.").optional(), to: z.string().describe("Target language code.") }, async (args) => {
    try { return text(await translate(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("detect_and_translate", "Translate text with automatic language detection.", { text: z.string().describe("Text to translate."), to: z.string().describe("Target language code.") }, async (args) => {
    try { return text(await detectAndTranslate(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
