import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { generate } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "inspirobot-mcp", version: "1.0.0" })
  server.tool("generate", "One generated inspirational quote image URL.", {  }, async (args) => {
    try { return text(await generate(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
