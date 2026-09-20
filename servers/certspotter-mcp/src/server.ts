import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { issuances } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "certspotter-mcp", version: "1.0.0" })
  server.registerTool(
    "issuances",
    {
      title: "Issuances",
      description: "Certificate issuances for a domain.",
      inputSchema: z.object( { domain: z.string().describe("Domain name."), limit: z.number().describe("Max results.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await issuances(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
