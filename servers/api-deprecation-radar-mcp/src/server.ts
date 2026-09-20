import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { format, inspectDeprecationRadar } from "./core.js"
const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const errorText = (error: unknown) => text(`Error: ${error instanceof Error ? error.message : String(error)}`)
export function createServer() {
  const server = new McpServer({ name: "api-deprecation-radar-mcp", version: "1.0.0" })
  server.registerTool(
    "inspect_deprecation_radar",
    {
      title: "Inspect deprecation radar",
      description: "Count local API deprecation markers by broad severity without returning endpoint names, paths, values, or source.",
      inputSchema: z.object( { project: z.string().min(1).max(1000).default(".") }),
      annotations: READ_ONLY,
    },
    async (input) => { try { return text(format(await inspectDeprecationRadar(input))) } catch (error) { return errorText(error) } }
  )
  return server
}
