import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { generateCode128 } from "./api.js"
import { generateEan } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "barcode-mcp", version: "1.0.0" })
  server.tool("generate_ean", "Generate an EAN-13 barcode as SVG.", { code: z.string().describe("12 or 13 digit EAN code.") }, async (args) => {
    try { return text(await generateEan(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("generate_code128", "Generate a Code-128 barcode as SVG.", { text: z.string().describe("Text to encode.") }, async (args) => {
    try { return text(await generateCode128(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
