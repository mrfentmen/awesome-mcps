import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { lookup } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "upcitemdb-mcp", version: "1.0.0" })
  server.tool("lookup", "Look up a barcode.", { upc: z.string().describe("UPC/EAN code.") }, async (args) => {
    try { return text(await lookup(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
