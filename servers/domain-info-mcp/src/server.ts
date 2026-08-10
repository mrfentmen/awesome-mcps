import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { domainInfo } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "domain-info-mcp", version: "1.0.0" })
  server.tool("domain_info", "Get registration info for a domain.", { domain: z.string().describe("Domain like example.com.") }, async (args) => {
    try { return text(await domainInfo(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
