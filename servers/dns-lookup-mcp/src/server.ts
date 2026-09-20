import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { lookup } from "./api.js"
import { lookupAll } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "dns-lookup-mcp", version: "1.0.0" })
  server.registerTool(
    "lookup",
    {
      title: "Lookup",
      description: "Look up DNS records for a domain.",
      inputSchema: z.object( { domain: z.string().describe("Domain name."), type: z.string().describe("Record type like A or MX.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await lookup(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "lookup_all",
    {
      title: "Lookup all",
      description: "Look up common DNS record types for a domain.",
      inputSchema: z.object( { domain: z.string().describe("Domain name.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await lookupAll(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
