import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { hashFile } from "./api.js"
import { hashText } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "checksum-mcp", version: "1.0.0" })
  server.registerTool(
    "hash_text",
    {
      title: "Hash text",
      description: "Hash a string with a chosen algorithm.",
      inputSchema: z.object( { text: z.string().describe("Text to hash."), algorithm: z.string().describe("sha256, sha1, or md5.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await hashText(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "hash_file",
    {
      title: "Hash file",
      description: "Hash a local file.",
      inputSchema: z.object( { path: z.string().describe("Path to the file."), algorithm: z.string().describe("sha256, sha1, or md5.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await hashFile(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
