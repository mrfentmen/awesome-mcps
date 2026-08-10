import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { info } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "deps-dev-mcp", version: "1.0.0" })
  server.tool("info", "Dependency data for one package version.", { system: z.string().describe("Ecosystem like npm or pypi."), name: z.string().describe("Package name."), version: z.string().describe("Version.").optional() }, async (args) => {
    try { return text(await info(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
