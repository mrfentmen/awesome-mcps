import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { scanCommon } from "./api.js"
import { scanHost } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "port-scanner-mcp", version: "1.0.0" })
  server.tool("scan_host", "Scan a host for open ports.", { host: z.string().describe("Host name or IP."), ports: z.string().describe("Comma separated port list.").optional(), timeout_ms: z.number().describe("Per port timeout in milliseconds.").optional() }, async (args) => {
    try { return text(await scanHost(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("scan_common", "Scan a host against common ports.", { host: z.string().describe("Host name or IP.") }, async (args) => {
    try { return text(await scanCommon(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
