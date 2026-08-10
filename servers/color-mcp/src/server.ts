import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { colorInfo } from "./api.js"
import { colorScheme } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "color-mcp", version: "1.0.0" })
  server.tool("color_info", "Get names and conversions for a color.", { hex: z.string().describe("Hex value like ff0000.") }, async (args) => {
    try { return text(await colorInfo(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("color_scheme", "Generate a color scheme.", { hex: z.string().describe("Base hex value."), mode: z.string().describe("Scheme mode like monochrome or analogic.").optional() }, async (args) => {
    try { return text(await colorScheme(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
