import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { generateQr } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const WRITE = { readOnlyHint: false, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "qr-code-mcp", version: "1.0.0" })
  server.registerTool(
    "generate_qr",
    {
      title: "Generate qr",
      description: "Generate a QR code PNG for any text or URL.",
      inputSchema: z.object( { text: z.string().describe("Text or URL to encode."), size: z.number().describe("Image size in pixels.").optional(), filename: z.string().describe("Output file name.").optional() }),
      annotations: WRITE,
    },
    async (args) => {
    try { return text(await generateQr(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
