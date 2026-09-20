import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { ip } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "maltiverse-mcp", version: "1.0.0" })
  server.registerTool(
    "ip",
    {
      title: "Ip",
      description: "Threat data for an IP address.",
      inputSchema: z.object( { address: z.string().describe("IP address.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await ip(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
