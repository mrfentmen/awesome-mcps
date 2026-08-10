import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { base64 } from "./api.js"
import { slugify } from "./api.js"
import { toCase } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "text-tools-mcp", version: "1.0.0" })
  server.tool("slugify", "Turn text into a URL slug.", { text: z.string().describe("Text to slugify.") }, async (args) => {
    try { return text(await slugify(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("to_case", "Convert text to a case.", { text: z.string().describe("Input text."), style: z.string().describe("camel, snake, kebab, or title.").optional() }, async (args) => {
    try { return text(await toCase(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("base64", "Encode or decode base64.", { text: z.string().describe("Input text."), decode: z.boolean().describe("Decode instead of encode.").optional() }, async (args) => {
    try { return text(await base64(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
