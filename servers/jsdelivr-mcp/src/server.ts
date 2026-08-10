import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { packageInfo } from "./api.js"
import { stats } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "jsdelivr-mcp", version: "1.0.0" })
  server.tool("package", "Versions for an npm package.", { name: z.string().describe("Package name like lodash.") }, async (args) => {
    try { return text(await packageInfo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("stats", "CDN usage statistics for an npm package.", { name: z.string().describe("Package name.") }, async (args) => {
    try { return text(await stats(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
