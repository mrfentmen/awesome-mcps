import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { project } from "./api.js"
import { projects } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "repology-mcp", version: "1.0.0" })
  server.tool("project", "Get package versions across repos.", { name: z.string().describe("Package name.") }, async (args) => {
    try { return text(await project(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("projects", "List all projects matching a pattern.", { pattern: z.string().describe("Name pattern.") }, async (args) => {
    try { return text(await projects(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
