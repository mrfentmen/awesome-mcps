import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { generateHotp } from "./api.js"
import { generateTotp } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "otp-mcp", version: "1.0.0" })
  server.tool("generate_totp", "Generate a TOTP code for a secret.", { secret: z.string().describe("Base32 secret.") }, async (args) => {
    try { return text(await generateTotp(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("generate_hotp", "Generate an HOTP code for a counter.", { secret: z.string().describe("Base32 secret."), counter: z.number().describe("Counter value.").optional() }, async (args) => {
    try { return text(await generateHotp(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
