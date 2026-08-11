import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { fuzz } from "./api.js"
import { whois } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "dnstwister-mcp", version: "1.0.0" })
  server.tool("fuzz", "Fuzz a domain for lookalike domains.", { domain: z.string().describe("Domain to fuzz.") }, async (args) => {
    try { return text(await fuzz(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("whois", "Get whois data for a domain.", { domain: z.string().describe("Domain.") }, async (args) => {
    try { return text(await whois(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
