import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { email } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "hudsonrock-mcp", version: "1.0.0" })
  server.tool("email", "Check if an email appeared in infostealer breaches.", { email: z.string().describe("Email address.") }, async (args) => {
    try { return text(await email(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
