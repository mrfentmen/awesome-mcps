import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { checkHash } from "./api.js"
import { checkPassword } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "password-breach-check-mcp", version: "1.0.0" })
  server.tool("check_password", "Check if a password appears in known breaches.", { password: z.string().describe("Password to check.") }, async (args) => {
    try { return text(await checkPassword(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("check_hash", "Check a SHA1 password hash prefix.", { sha1_hash: z.string().describe("Full SHA1 hash of the password.") }, async (args) => {
    try { return text(await checkHash(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
