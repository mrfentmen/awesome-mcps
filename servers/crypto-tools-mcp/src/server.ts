import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { hash } from "./api.js"
import { hmac } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "crypto-tools-mcp", version: "1.0.0" })
  server.registerTool(
    "hash",
    {
      title: "Hash",
      description: "Hash text with an algorithm.",
      inputSchema: z.object( { text: z.string().describe("Input text."), algorithm: z.string().describe("md5, sha1, sha256, or sha512.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await hash(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "hmac",
    {
      title: "Hmac",
      description: "Compute an HMAC for text.",
      inputSchema: z.object( { text: z.string().describe("Input text."), key: z.string().describe("Secret key.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await hmac(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
