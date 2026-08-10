import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { node } from "./api.js"
import { nodes } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "osf-mcp", version: "1.0.0" })
  server.tool("nodes", "Recent public nodes.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await nodes(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("node", "Get a node by id.", { id: z.string().describe("Node id.") }, async (args) => {
    try { return text(await node(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
