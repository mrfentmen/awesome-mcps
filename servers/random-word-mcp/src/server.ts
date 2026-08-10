import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { word } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "random-word-mcp", version: "1.0.0" })
  server.tool("word", "One or more random words.", { count: z.number().describe("Number of words.").optional() }, async (args) => {
    try { return text(await word(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
