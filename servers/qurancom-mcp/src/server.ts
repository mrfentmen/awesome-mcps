import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { chapter } from "./api.js"
import { chapters } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "qurancom-mcp", version: "1.0.0" })
  server.tool("chapters", "List chapters.", {  }, async (args) => {
    try { return text(await chapters(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("chapter", "Get a chapter by id.", { id: z.number().describe("Chapter id.") }, async (args) => {
    try { return text(await chapter(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
