import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { expand } from "./api.js"
import { shorten } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "link-shortener-mcp", version: "1.0.0" })
  server.tool("shorten", "Shorten a URL.", { url: z.string().describe("The URL to shorten.") }, async (args) => {
    try { return text(await shorten(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("expand", "Expand a short URL.", { url: z.string().describe("The short URL.") }, async (args) => {
    try { return text(await expand(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
