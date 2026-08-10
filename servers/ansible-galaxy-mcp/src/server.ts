import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { collection } from "./api.js"
import { collections } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ansible-galaxy-mcp", version: "1.0.0" })
  server.tool("collections", "Search Ansible collections.", { search: z.string().describe("Optional search terms.").optional(), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await collections(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("collection", "Details for one collection.", { namespace: z.string().describe("Namespace."), name: z.string().describe("Collection name.") }, async (args) => {
    try { return text(await collection(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
