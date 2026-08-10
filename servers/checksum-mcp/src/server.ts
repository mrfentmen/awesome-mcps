import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { hashFile } from "./api.js"
import { hashText } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "checksum-mcp", version: "1.0.0" })
  server.tool("hash_text", "Hash a string with a chosen algorithm.", { text: z.string().describe("Text to hash."), algorithm: z.string().describe("sha256, sha1, or md5.").optional() }, async (args) => {
    try { return text(await hashText(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("hash_file", "Hash a local file.", { path: z.string().describe("Path to the file."), algorithm: z.string().describe("sha256, sha1, or md5.").optional() }, async (args) => {
    try { return text(await hashFile(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
