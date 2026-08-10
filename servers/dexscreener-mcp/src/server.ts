import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { search } from "./api.js"
import { tokens } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "dexscreener-mcp", version: "1.0.0" })
  server.tool("search", "Search token pairs.", { query: z.string().describe("Token symbol or name.") }, async (args) => {
    try { return text(await search(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("tokens", "Top pairs for a token.", { address: z.string().describe("Token address.") }, async (args) => {
    try { return text(await tokens(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
