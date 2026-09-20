import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { colorInfo } from "./api.js"
import { colorScheme } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "color-mcp", version: "1.0.0" })
  server.registerTool(
    "color_info",
    {
      title: "Color info",
      description: "Get names and conversions for a color.",
      inputSchema: z.object( { hex: z.string().describe("Hex value like ff0000.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await colorInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "color_scheme",
    {
      title: "Color scheme",
      description: "Generate a color scheme.",
      inputSchema: z.object( { hex: z.string().describe("Base hex value."), mode: z.string().describe("Scheme mode like monochrome or analogic.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await colorScheme(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
