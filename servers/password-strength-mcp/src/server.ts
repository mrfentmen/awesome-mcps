import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { checkPassword } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "password-strength-mcp", version: "1.0.0" })
  server.tool("check_password", "Score a password and suggest improvements.", { password: z.string().describe("The password to check.") }, async (args) => {
    try { return text(await checkPassword(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
