import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { node } from "./api.js"
import { nodes } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "osf-mcp", version: "1.0.0" })
  server.registerTool(
    "nodes",
    {
      title: "Nodes",
      description: "Recent public nodes.",
      inputSchema: z.object( { limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await nodes(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "node",
    {
      title: "Node",
      description: "Get a node by id.",
      inputSchema: z.object( { id: z.string().describe("Node id.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await node(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
