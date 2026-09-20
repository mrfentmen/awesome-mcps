import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { fuzz } from "./api.js"
import { whois } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "dnstwister-mcp", version: "1.0.0" })
  server.registerTool(
    "fuzz",
    {
      title: "Fuzz",
      description: "Fuzz a domain for lookalike domains.",
      inputSchema: z.object( { domain: z.string().describe("Domain to fuzz.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await fuzz(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "whois",
    {
      title: "Whois",
      description: "Get whois data for a domain.",
      inputSchema: z.object( { domain: z.string().describe("Domain.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await whois(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
