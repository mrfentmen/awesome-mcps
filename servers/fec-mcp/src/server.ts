import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { candidates } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "fec-mcp", version: "1.0.0" })
  server.tool("candidates", "Search federal candidates.", { query: z.string().describe("Candidate name."), limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await candidates(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
