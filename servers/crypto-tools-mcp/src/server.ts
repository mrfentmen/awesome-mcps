import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { hash } from "./api.js"
import { hmac } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "crypto-tools-mcp", version: "1.0.0" })
  server.tool("hash", "Hash text with an algorithm.", { text: z.string().describe("Input text."), algorithm: z.string().describe("md5, sha1, sha256, or sha512.").optional() }, async (args) => {
    try { return text(await hash(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("hmac", "Compute an HMAC for text.", { text: z.string().describe("Input text."), key: z.string().describe("Secret key.") }, async (args) => {
    try { return text(await hmac(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
