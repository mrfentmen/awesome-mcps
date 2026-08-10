import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formula } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "homebrew-mcp", version: "1.0.0" })
  server.tool("formula", "Details for one Homebrew formula.", { name: z.string().describe("Formula name like git.") }, async (args) => {
    try { return text(await formula(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
