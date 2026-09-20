import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { generatePassword } from "./api.js"
import { passphrase } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "password-generator-mcp", version: "1.0.0" })
  server.registerTool(
    "generate_password",
    {
      title: "Generate password",
      description: "Generate a random password with options.",
      inputSchema: z.object( { length: z.number().describe("Length.").optional(), symbols: z.boolean().describe("Include symbols.").optional(), numbers: z.boolean().describe("Include numbers.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await generatePassword(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "passphrase",
    {
      title: "Passphrase",
      description: "Generate a random passphrase of words.",
      inputSchema: z.object( { words: z.number().describe("Number of words.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await passphrase(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
