import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { latest } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "golang-proxy-mcp", version: "1.0.0" })
  server.tool("latest", "Latest version of a module.", { module: z.string().describe("Module path like github.com/gorilla/mux.") }, async (args) => {
    try { return text(await latest(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
