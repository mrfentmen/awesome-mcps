import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { certInfo } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ssl-cert-mcp", version: "1.0.0" })
  server.tool("cert_info", "Get TLS certificate details for a host.", { host: z.string().describe("Hostname like example.com."), port: z.number().describe("Port, default 443.").optional() }, async (args) => {
    try { return text(await certInfo(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
