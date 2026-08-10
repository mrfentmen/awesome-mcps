import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { generatePassword } from "./api.js"
import { passphrase } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "password-generator-mcp", version: "1.0.0" })
  server.tool("generate_password", "Generate a random password with options.", { length: z.number().describe("Length.").optional(), symbols: z.boolean().describe("Include symbols.").optional(), numbers: z.boolean().describe("Include numbers.").optional() }, async (args) => {
    try { return text(await generatePassword(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("passphrase", "Generate a random passphrase of words.", { words: z.number().describe("Number of words.").optional() }, async (args) => {
    try { return text(await passphrase(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
