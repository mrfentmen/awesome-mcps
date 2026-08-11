import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { browse } from "./api.js"
import { resolve } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "esm-mcp", version: "1.0.0" })
  server.tool("resolve", "Resolve a package version and module URL on esm.sh.", { name: z.string().describe("Package name."), version: z.string().describe("Optional version.").optional() }, async (args) => {
    try { return text(await resolve(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("browse", "Browse a module file in a package.", { name: z.string().describe("Package name."), version: z.string().describe("Optional version.").optional(), path: z.string().describe("File path inside the package.").optional() }, async (args) => {
    try { return text(await browse(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
