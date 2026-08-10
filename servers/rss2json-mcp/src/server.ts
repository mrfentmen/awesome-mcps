import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { feed } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "rss2json-mcp", version: "1.0.0" })
  server.tool("feed", "Fetch an RSS feed as JSON.", { url: z.string().describe("RSS feed URL."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await feed(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
