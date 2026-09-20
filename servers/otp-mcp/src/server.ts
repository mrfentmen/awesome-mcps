import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { generateHotp } from "./api.js"
import { generateTotp } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "otp-mcp", version: "1.0.0" })
  server.registerTool(
    "generate_totp",
    {
      title: "Generate totp",
      description: "Generate a TOTP code for a secret.",
      inputSchema: z.object( { secret: z.string().describe("Base32 secret.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await generateTotp(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "generate_hotp",
    {
      title: "Generate hotp",
      description: "Generate an HOTP code for a counter.",
      inputSchema: z.object( { secret: z.string().describe("Base32 secret."), counter: z.number().describe("Counter value.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await generateHotp(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
