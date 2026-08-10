import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { lookup } from "./api.js"
import { validate } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "isbn-mcp", version: "1.0.0" })
  server.tool("validate", "Check an ISBN 10 or ISBN 13 checksum.", { isbn: z.string().describe("The ISBN to check.") }, async (args) => {
    try { return text(await validate(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("lookup", "Look up a book by ISBN.", { isbn: z.string().describe("The ISBN to look up.") }, async (args) => {
    try { return text(await lookup(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
