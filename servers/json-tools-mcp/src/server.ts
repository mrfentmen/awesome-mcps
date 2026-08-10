import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { formatJson } from "./api.js"
import { jsonInfo } from "./api.js"
import { validateJson } from "./api.js"

const text = (value: string) => ({ content: [{ type: "text" as const, text: value }] })
const error = (e: unknown) => `Error: ${e instanceof Error ? e.message : String(e)}`

export function createServer(): McpServer {
  const server = new McpServer({ name: "json-tools-mcp", version: "1.0.0" })
  server.tool("validate_json", "Check if a string is valid JSON and report errors.", { json: z.string().describe("JSON text to check.") }, async (args) => {
    try { return text(await validateJson(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("format_json", "Pretty print a JSON string.", { json: z.string().describe("JSON text to format."), indent: z.number().describe("Indent spaces.").optional() }, async (args) => {
    try { return text(await formatJson(args)) } catch (e) { return text(error(e)) }
  })
  server.tool("json_info", "Return the top level type and key count of JSON.", { json: z.string().describe("JSON text to inspect.") }, async (args) => {
    try { return text(await jsonInfo(args)) } catch (e) { return text(error(e)) }
  })
  return server
}
