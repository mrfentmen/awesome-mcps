import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { generateCode128 } from "./api.js"
import { generateEan } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "barcode-mcp", version: "1.0.0" })
  server.registerTool(
    "generate_ean",
    {
      title: "Generate ean",
      description: "Generate an EAN-13 barcode as SVG.",
      inputSchema: z.object( { code: z.string().describe("12 or 13 digit EAN code.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await generateEan(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "generate_code128",
    {
      title: "Generate code128",
      description: "Generate a Code-128 barcode as SVG.",
      inputSchema: z.object( { text: z.string().describe("Text to encode.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await generateCode128(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
