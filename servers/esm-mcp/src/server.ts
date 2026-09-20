import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { browse } from "./api.js"
import { resolve } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "esm-mcp", version: "1.0.0" })
  server.registerTool(
    "resolve",
    {
      title: "Resolve",
      description: "Resolve a package version and module URL on esm.sh.",
      inputSchema: z.object( { name: z.string().describe("Package name."), version: z.string().describe("Optional version.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await resolve(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "browse",
    {
      title: "Browse",
      description: "Browse a module file in a package.",
      inputSchema: z.object( { name: z.string().describe("Package name."), version: z.string().describe("Optional version.").optional(), path: z.string().describe("File path inside the package.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await browse(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
