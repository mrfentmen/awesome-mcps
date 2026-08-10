import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { cert } from "./api.js"
import { check } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "uptime-mcp", version: "1.0.0" })
  server.tool("check", "HTTP status and latency for a URL.", { url: z.string().describe("URL like https://example.com.") }, async (args) => {
    try { return text(await check(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("cert", "TLS certificate expiry for a host.", { host: z.string().describe("Hostname like example.com.") }, async (args) => {
    try { return text(await cert(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
