import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatJson } from "./api.js"
import { jsonInfo } from "./api.js"
import { validateJson } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const textError = (t: string) => ({ content: [{ type: "text" as const, text: t }], isError: true as const })
const READ_ONLY = { readOnlyHint: true, openWorldHint: true } as const
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "json-tools-mcp", version: "1.0.0" })
  server.registerTool(
    "validate_json",
    {
      title: "Validate json",
      description: "Check if a string is valid JSON and report errors.",
      inputSchema: z.object( { json: z.string().describe("JSON text to check.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await validateJson(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "format_json",
    {
      title: "Format json",
      description: "Pretty print a JSON string.",
      inputSchema: z.object( { json: z.string().describe("JSON text to format."), indent: z.number().describe("Indent spaces.").optional() }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await formatJson(args)) } catch (e) { return textError(error(e)) }
  }
  )
  server.registerTool(
    "json_info",
    {
      title: "Json info",
      description: "Return the top level type and key count of JSON.",
      inputSchema: z.object( { json: z.string().describe("JSON text to inspect.") }),
      annotations: READ_ONLY,
    },
    async (args) => {
    try { return text(await jsonInfo(args)) } catch (e) { return textError(error(e)) }
  }
  )
  return server
}
