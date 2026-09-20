import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { scanCommon } from "./api.js"
import { scanHost } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "port-scanner-mcp", version: "1.0.0" })
  server.registerTool(
    "scan_host",
    {
      title: "Scan host",
      description: "Scan a host for open ports.",
      inputSchema: z.object( { host: z.string().describe("Host name or IP."), ports: z.string().describe("Comma separated port list.").optional(), timeout_ms: z.number().describe("Per port timeout in milliseconds.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await scanHost(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "scan_common",
    {
      title: "Scan common",
      description: "Scan a host against common ports.",
      inputSchema: z.object( { host: z.string().describe("Host name or IP.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await scanCommon(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
