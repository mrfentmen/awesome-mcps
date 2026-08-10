import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { size } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "bundlephobia-mcp", version: "1.0.0" })
  server.tool("size", "Bundle size for a package.", { name: z.string().describe("Package name.") }, async (args) => {
    try { return text(await size(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
