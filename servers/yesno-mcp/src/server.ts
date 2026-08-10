import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { answer } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "yesno-mcp", version: "1.0.0" })
  server.tool("answer", "A random yes or no answer.", {  }, async (args) => {
    try { return text(await answer(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
