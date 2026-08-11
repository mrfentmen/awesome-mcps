import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { jobs } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "jobicy-mcp", version: "1.0.0" })
  server.tool("jobs", "List remote jobs.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await jobs(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
