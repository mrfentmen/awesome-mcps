import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { nationality } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "nationalize-mcp", version: "1.0.0" })
  server.tool("nationality", "Estimated nationalities for a name.", { name: z.string().describe("First name.") }, async (args) => {
    try { return text(await nationality(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
