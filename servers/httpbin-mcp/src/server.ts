import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { get } from "./api.js"
import { headers } from "./api.js"
import { ip } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "httpbin-mcp", version: "1.0.0" })
  server.registerTool(
    "get",
    {
      title: "Get",
      description: "Send a GET request and see echo.",
      inputSchema: z.object( { path: z.string().describe("Endpoint path.") }),
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
  server.registerTool(
    "headers",
    {
      title: "Headers",
      description: "Request headers echo.",
      inputSchema: z.object( {  }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await headers(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
