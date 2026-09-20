import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { cert } from "./api.js"
import { check } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "uptime-mcp", version: "1.0.0" })
  server.registerTool(
    "check",
    {
      title: "Check",
      description: "HTTP status and latency for a URL.",
      inputSchema: z.object( { url: z.string().describe("URL like https://example.com.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await check(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "cert",
    {
      title: "Cert",
      description: "TLS certificate expiry for a host.",
      inputSchema: z.object( { host: z.string().describe("Hostname like example.com.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await cert(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
