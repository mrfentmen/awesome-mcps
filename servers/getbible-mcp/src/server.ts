import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { chapter } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "getbible-mcp", version: "1.0.0" })
  server.tool("chapter", "One Bible chapter.", { book: z.string().describe("Book name like john."), chapter: z.number().describe("Chapter number.") }, async (args) => {
    try { return text(await chapter(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
