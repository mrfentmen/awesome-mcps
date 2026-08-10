import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { age } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "agify-mcp", version: "1.0.0" })
  server.tool("age", "Estimated age for a name.", { name: z.string().describe("First name.") }, async (args) => {
    try { return text(await age(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
