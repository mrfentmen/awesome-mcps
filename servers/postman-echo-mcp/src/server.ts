import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { get } from "./api.js"
import { ip } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "postman-echo-mcp", version: "1.0.0" })
  server.registerTool(
    "get",
    {
      title: "Get",
      description: "Echo a GET request.",
      inputSchema: z.object( { params: z.string().describe("Query params as a=b&c=d.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await get(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "ip",
    {
      title: "Ip",
      description: "Your outbound IP.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await ip(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
