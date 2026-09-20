import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { checkHash } from "./api.js"
import { checkPassword } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "password-breach-check-mcp", version: "1.0.0" })
  server.registerTool(
    "check_password",
    {
      title: "Check password",
      description: "Check if a password appears in known breaches.",
      inputSchema: z.object( { password: z.string().describe("Password to check.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await checkPassword(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "check_hash",
    {
      title: "Check hash",
      description: "Check a SHA1 password hash prefix.",
      inputSchema: z.object( { sha1_hash: z.string().describe("Full SHA1 hash of the password.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await checkHash(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
