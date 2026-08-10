import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { lookup } from "./api.js"
import { lookupAll } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "dns-lookup-mcp", version: "1.0.0" })
  server.tool("lookup", "Look up DNS records for a domain.", { domain: z.string().describe("Domain name."), type: z.string().describe("Record type like A or MX.").optional() }, async (args) => {
    try { return text(await lookup(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("lookup_all", "Look up common DNS record types for a domain.", { domain: z.string().describe("Domain name.") }, async (args) => {
    try { return text(await lookupAll(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
