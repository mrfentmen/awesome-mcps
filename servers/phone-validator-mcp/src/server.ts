import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { validate } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "phone-validator-mcp", version: "1.0.0" })
  server.tool("validate", "Check a phone number and show its parts.", { number: z.string().describe("Phone number in any format."), country: z.string().describe("Two letter country code for context.").optional() }, async (args) => {
    try { return text(await validate(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
