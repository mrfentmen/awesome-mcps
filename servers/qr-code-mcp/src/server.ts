import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { generateQr } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "qr-code-mcp", version: "1.0.0" })
  server.tool("generate_qr", "Generate a QR code PNG for any text or URL.", { text: z.string().describe("Text or URL to encode."), size: z.number().describe("Image size in pixels.").optional(), filename: z.string().describe("Output file name.").optional() }, async (args) => {
    try { return text(await generateQr(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
