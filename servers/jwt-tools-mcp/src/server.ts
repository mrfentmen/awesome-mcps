import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { decode } from "./api.js"
import { verify } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "jwt-tools-mcp", version: "1.0.0" })
  server.tool("decode", "Decode a JWT header and payload.", { token: z.string().describe("The JWT string.") }, async (args) => {
    try { return text(await decode(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("verify", "Verify a JWT signature with a secret.", { token: z.string().describe("The JWT string."), secret: z.string().describe("HMAC secret.") }, async (args) => {
    try { return text(await verify(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
