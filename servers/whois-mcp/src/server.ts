import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { m0_domain, m0_ip, m1_domainInfo } from './api.js'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`
const errorMessage = error

export function createServer(): McpServer {
  const server = new McpServer({ name: 'whois-mcp', version: '1.0.0' })
server.registerTool(
    "domain",
    {
      title: "Domain",
      description: "Registration record for a domain.",
      inputSchema: z.object( { domain: z.string().describe("Domain like example.com.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_domain(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "ip",
    {
      title: "Ip",
      description: "Registration record for an IP address.",
      inputSchema: z.object( { ip: z.string().describe("IPv4 or IPv6 address.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m0_ip(args)) } catch (e) { return textError(error(e)) }
  }
  )
server.registerTool(
    "domain_info",
    {
      title: "Domain info",
      description: "Get registration info for a domain.",
      inputSchema: z.object( { domain: z.string().describe("Domain like example.com.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await m1_domainInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
