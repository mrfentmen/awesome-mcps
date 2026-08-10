import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { validateBatch } from "./api.js"
import { validateEmail } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "email-validator-mcp", version: "1.0.0" })
  server.tool("validate_email", "Check an email address format, MX record, and disposable status.", { email: z.string().describe("Email address to validate.") }, async (args) => {
    try { return text(await validateEmail(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("validate_batch", "Check a list of comma separated email addresses.", { emails: z.string().describe("Comma separated email addresses.") }, async (args) => {
    try { return text(await validateBatch(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
