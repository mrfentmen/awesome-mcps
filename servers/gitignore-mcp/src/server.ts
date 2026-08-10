import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { template } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "gitignore-mcp", version: "1.0.0" })
  server.tool("template", "Get a gitignore template.", { name: z.string().describe("Template name like node.") }, async (args) => {
    try { return text(await template(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
