import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { resolve } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ensideas-mcp", version: "1.0.0" })
  server.tool("resolve", "Resolve an ENS name to an address.", { name: z.string().describe("ENS name like vitalik.eth.") }, async (args) => {
    try { return text(await resolve(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
