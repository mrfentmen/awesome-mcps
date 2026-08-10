import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { info } from "./api.js"
import { validate } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "iban-validator-mcp", version: "1.0.0" })
  server.tool("validate", "Check if an IBAN is valid.", { iban: z.string().describe("The IBAN to check.") }, async (args) => {
    try { return text(await validate(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("info", "Show country and structure for an IBAN.", { iban: z.string().describe("The IBAN to inspect.") }, async (args) => {
    try { return text(await info(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
