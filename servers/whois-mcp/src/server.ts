import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { domain } from "./api.js"
import { ip } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "whois-mcp", version: "1.0.0" })
  server.tool("domain", "Registration record for a domain.", { domain: z.string().describe("Domain like example.com.") }, async (args) => {
    try { return text(await domain(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("ip", "Registration record for an IP address.", { ip: z.string().describe("IPv4 or IPv6 address.") }, async (args) => {
    try { return text(await ip(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
