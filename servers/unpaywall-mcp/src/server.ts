import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { oa } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "unpaywall-mcp", version: "1.0.0" })
  server.tool("oa", "Find open access for a DOI.", { doi: z.string().describe("DOI."), email: z.string().describe("Email for the API.").optional() }, async (args) => {
    try { return text(await oa(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
