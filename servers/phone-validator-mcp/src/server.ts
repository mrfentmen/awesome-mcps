import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { validate } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "phone-validator-mcp", version: "1.0.0" })
  server.registerTool(
    "validate",
    {
      title: "Validate",
      description: "Check a phone number and show its parts.",
      inputSchema: z.object( { number: z.string().describe("Phone number in any format."), country: z.string().describe("Two letter country code for context.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await validate(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
