import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { project } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "nasa-techport-mcp", version: "1.0.0" })
  server.tool("project", "One NASA TechPort project.", { id: z.number().describe("Project ID.") }, async (args) => {
    try { return text(await project(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
