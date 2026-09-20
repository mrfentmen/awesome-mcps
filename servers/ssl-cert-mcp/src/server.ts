import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { certInfo } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "ssl-cert-mcp", version: "1.0.0" })
  server.registerTool(
    "cert_info",
    {
      title: "Cert info",
      description: "Get TLS certificate details for a host.",
      inputSchema: z.object( { host: z.string().describe("Hostname like example.com."), port: z.number().describe("Port, default 443.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await certInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
