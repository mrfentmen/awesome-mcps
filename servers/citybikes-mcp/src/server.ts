import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { network } from "./api.js"
import { networks } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "citybikes-mcp", version: "1.0.0" })
  server.registerTool(
    "networks",
    {
      title: "Networks",
      description: "All bike share networks.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await networks(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "network",
    {
      title: "Network",
      description: "Live stations for one network.",
      inputSchema: z.object( { id: z.string().describe("Network ID like bixi-montreal.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await network(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
