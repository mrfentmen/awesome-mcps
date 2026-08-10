import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { issuances } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "certspotter-mcp", version: "1.0.0" })
  server.tool("issuances", "Certificate issuances for a domain.", { domain: z.string().describe("Domain name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await issuances(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
