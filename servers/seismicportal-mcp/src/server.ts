import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { recent } from "./api.js"
import { significant } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "seismicportal-mcp", version: "1.0.0" })
  server.tool("recent", "Recent earthquakes.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await recent(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("significant", "Significant earthquakes.", { limit: z.number().describe("Max results.").optional() }, async (args) => {
    try { return text(await significant(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
