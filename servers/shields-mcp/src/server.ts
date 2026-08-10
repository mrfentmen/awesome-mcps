import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { badge } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "shields-mcp", version: "1.0.0" })
  server.tool("badge", "Build a badge URL.", { label: z.string().describe("Label text."), message: z.string().describe("Message text."), color: z.string().describe("Color like green.").optional() }, async (args) => {
    try { return text(await badge(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
