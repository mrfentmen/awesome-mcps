import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { info } from "./api.js"
import { validate } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "iban-validator-mcp", version: "1.0.0" })
  server.registerTool(
    "validate",
    {
      title: "Validate",
      description: "Check if an IBAN is valid.",
      inputSchema: z.object( { iban: z.string().describe("The IBAN to check.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await validate(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "info",
    {
      title: "Info",
      description: "Show country and structure for an IBAN.",
      inputSchema: z.object( { iban: z.string().describe("The IBAN to inspect.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await info(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
