import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { channel } from "./api.js"
import { channels } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "somafm-mcp", version: "1.0.0" })
  server.tool("channels", "List channels.", { genre: z.string().describe("Optional genre filter.").optional() }, async (args) => {
    try { return text(await channels(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("channel", "Get a channel by id.", { id: z.string().describe("Channel id.") }, async (args) => {
    try { return text(await channel(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
